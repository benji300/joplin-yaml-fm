import joplin from 'api';
import { MenuItem, MenuItemLocation } from 'api/types';
import { ChangeEvent } from 'api/JoplinSettings';
import { PanelVisibility, SettingDefaults, Settings } from './settings';
import { Panel } from './panel';
import { DA } from './data';
import YAML = require('yaml');

joplin.plugins.register({
  onStart: async function () {
    const COMMANDS = joplin.commands;
    const DATA = joplin.data;
    const SETTINGS = joplin.settings;
    const WORKSPACE = joplin.workspace;
    // settings
    const settings: Settings = new Settings();
    await settings.register();
    // panel
    const panel = new Panel(settings);
    await panel.register();

    //#region HELPERS

    async function getYamlFromNote(note: any): Promise<string | null> {
      const noteBody: string[] = note.body.split('\n');

      // first line must start with front matter header
      if (!noteBody.shift().match(/^(---|```yaml|<!--\s*yaml)/i))
        return;

      // if valid collect all lines till yaml footer
      const yaml: string[] = [];
      for (const line of noteBody) {
        // stop if footer is reached
        if (line.match(/^(---|```|-->)/i)) break;
        yaml.push(line);
      }
      return yaml.join('\n');
    }

    async function updatePanel() {
      try {
        const selectedNote: any = await WORKSPACE.selectedNote();
        let yaml: any;

        if (selectedNote) {
          // get YAML front matter string from note body, if exists
          const yamlStr: string = await getYamlFromNote(selectedNote);

          // parse string to YAML object
          if (yamlStr) {
            yaml = YAML.parseDocument(yamlStr, {
              mapAsMap: true,
              prettyErrors: true,
              customTags: ['bool']
            });
          }
          console.debug(`YAML object of note '${selectedNote.title}':\n${YAML.stringify(yaml)}`);
        }

        // Toggle panel visibility (return if invisible)
        if (settings.hasPanelVisibility(PanelVisibility.Automatic)) {
          if (yaml) {
            await panel.forceVisibility(true);
          } else {
            return await panel.forceVisibility(false);
          }
        }

        await panel.updateWebview(yaml);
      } catch (error) {
        console.error(`onNoteSelectionChange: ${error}`);
      }
    }

    //#endregion

    //#region COMMANDS

    // Command: yamlRefresh
    // Desc: Toggle panel visibility
    await COMMANDS.register({
      name: 'yamlRefresh',
      label: 'Refresh front matter panel',
      iconName: 'fas fa-sync-alt',
      execute: async () => {
        await updatePanel();
      }
    });

    // Command: yamlToggleVisibility
    // Desc: Toggle panel visibility
    await COMMANDS.register({
      name: 'yamlToggleVisibility',
      label: 'Toggle front matter panel visibility',
      iconName: 'fas fa-eye-slash',
      execute: async () => {
        await panel.toggleVisibility();
      }
    });

    // prepare commands menu
    const commandsSubMenu: MenuItem[] = [
      {
        commandName: 'yamlRefresh',
        label: 'Refresh panel'
      },
      {
        commandName: 'yamlToggleVisibility',
        label: 'Toggle panel visibility'
      }
    ];
    await joplin.views.menus.create('toolsYaml', 'Front Matter', commandsSubMenu, MenuItemLocation.Tools);

    // add commands to note menu
    // await joplin.views.menuItems.create('noteMenuYamlRefresh', 'yamlRefresh', MenuItemLocation.Note);

    // add commands to editor context menu
    await joplin.views.menuItems.create('editorContextMenuYamlRefresh', 'yamlRefresh', MenuItemLocation.EditorContextMenu);

    //#endregion

    //#region EVENTS

    // let onChangeCnt = 0;
    SETTINGS.onChange(async (event: ChangeEvent) => {
      // console.debug(`onChange() hits: ${onChangeCnt++}`);
      await settings.read(event);
      await updatePanel();
    });

    WORKSPACE.onNoteSelectionChange(async () => {
      await updatePanel();
    });

    //#endregion

    await updatePanel();
  }
});
