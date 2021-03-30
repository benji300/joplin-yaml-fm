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

    //#endregion

    //#region COMMANDS

    //#endregion

    //#region EVENTS

    // let onChangeCnt = 0;
    SETTINGS.onChange(async (event: ChangeEvent) => {
      // console.debug(`onChange() hits: ${onChangeCnt++}`);
      await settings.read(event);
      await panel.updateWebview();
    });

    async function getYamlFromNote(note: any): Promise<string | null> {
      const noteBody: string[] = note.body.split('\n');

      // TODO support other styles too (comment, default)

      // first line must start with front matter header
      if (!noteBody.shift().match(/^```yaml/i))
        return;

      // if valid collect all lines till yaml footer
      const yaml: string[] = [];
      for (const line of noteBody) {
        // stop if footer is reached
        if (line.match(/^```/i)) break;
        yaml.push(line);
      }
      return yaml.join('\n');
    }

    WORKSPACE.onNoteSelectionChange(async () => {
      try {
        const selectedNote: any = await WORKSPACE.selectedNote();
        let yaml: any;

        if (selectedNote) {
          // get YAML front matter string from note body, if exists
          const yamlStr: string = await getYamlFromNote(selectedNote);

          // parse string to YAML object
          // TODO check and test options: https://eemeli.org/yaml/v1/#options
          // Test: prettyErrors
          // Test: https://eemeli.org/yaml/v1/#built-in-custom-tags
          if (yamlStr) {
            yaml = YAML.parse(yamlStr, { mapAsMap: true });
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

        // TODO was ist wenn yaml leer ist? => Dann nur eine Meldung ausgeben "selected note does not contain YAML front matter data."
        await panel.updateWebview(yaml);
      } catch (error) {
        console.error(`onNoteSelectionChange: ${error}`);
      }
    });

    //#endregion

    await panel.updateWebview();
  }
});
