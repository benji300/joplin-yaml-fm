import joplin from 'api';
import { MenuItem, MenuItemLocation } from 'api/types';
import { ChangeEvent } from 'api/JoplinSettings';
import { SettingDefaults, Settings } from './settings';
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
            yaml = YAML.parseDocument(yamlStr, { mapAsMap: true, prettyErrors: true });
          }
          console.log(`yaml object: ${selectedNote.title}`);
          console.log(`${YAML.stringify(yaml)}`);
        }

        // TODO check display panel option here
        // if yaml == null && option == auto 
        //   togglePanelvisibility == false
        //   then also return (to prevent obsolete update of panel)
        // else
        //  ensure visibility of panel (and go ahead)

        await panel.updateWebview(yaml);
      } catch (error) {
        console.error(`onNoteSelectionChange: ${error}`);
      }
    }

    //#endregion

    //#region COMMANDS

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