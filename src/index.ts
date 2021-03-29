import joplin from 'api';
import { MenuItem, MenuItemLocation } from 'api/types';
import { ChangeEvent } from 'api/JoplinSettings';
import { SettingDefaults, Settings } from './settings';
import { Panel } from './panel';
import { DA } from './data';

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

    WORKSPACE.onNoteSelectionChange(async () => {
      try {
        const selectedNote: any = await WORKSPACE.selectedNote();
        let yaml: any;

        if (selectedNote) {
          // TODO parse noteBody for YAML data

          // TODO create yaml object
          // yaml = ?
        }

        // TODO pass yaml object - if null panel shall not be shown
        await panel.updateWebview();
      } catch (error) {
        console.error(`onNoteSelectionChange: ${error}`);
      }
    });

    //#endregion

    await panel.updateWebview();
  }
});
