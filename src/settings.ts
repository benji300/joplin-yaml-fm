import joplin from 'api';
import { SettingItemType } from 'api/types';
import { ChangeEvent } from 'api/JoplinSettings';
import { DA } from './data';

// /**
//  * Predefined keyboard shortcuts.
//  */
// export enum DefaultKeys {
//   QuickMove1 = 'CmdOrCtrl+Shift+1',
//   QuickMove2 = 'CmdOrCtrl+Shift+2',
//   QuickMove3 = 'CmdOrCtrl+Shift+3',
//   QuickMove4 = 'CmdOrCtrl+Shift+4',
//   QuickMove5 = 'CmdOrCtrl+Shift+5',
//   QuickMove6 = 'CmdOrCtrl+Shift+6',
//   QuickMove7 = 'CmdOrCtrl+Shift+7',
//   QuickMove8 = 'CmdOrCtrl+Shift+8',
//   QuickMove9 = 'CmdOrCtrl+Shift+9'
// }

/**
 * Advanced style setting default values.
 * Used when setting is set to 'default'.
 */
export enum SettingDefaults {
  Empty = '0',
  Default = 'default',
  LineHeight = '1.5em',
  FontFamily = 'Roboto',
  FontSize = 'var(--joplin-font-size)',
  Background = 'var(--joplin-background-color)',
  KeyBackground = 'var(--joplin-background-color3)',
  Foreground = 'var(--joplin-color)',
  DividerColor = 'var(--joplin-divider-color)',
  ListStyleType = 'Disc'
}

export enum PanelVisibility {
  Always,
  Automatic
}

/**
 * Definitions of plugin settings.
 */
export class Settings {
  // private settings
  // none
  // general settings
  private _panelVisibility: PanelVisibility = PanelVisibility.Always;
  private _showPanelTitle: boolean = true;
  private _lineHeight: number = 21;
  // advanced settings
  private _fontFamily: string = SettingDefaults.Default;
  private _fontSize: string = SettingDefaults.Default;
  private _background: string = SettingDefaults.Default;
  private _keyBackground: string = SettingDefaults.Default;
  private _valueBackground: string = SettingDefaults.Default;
  private _foreground: string = SettingDefaults.Default;
  private _dividerColor: string = SettingDefaults.Default;
  private _listStyleType: string = SettingDefaults.Default;
  // internals
  private _defaultRegExp: RegExp = new RegExp(SettingDefaults.Default, "i");

  constructor() {
  }

  //#region GETTER

  get panelVisibility(): PanelVisibility {
    return this._panelVisibility;
  }

  hasPanelVisibility(visibility: PanelVisibility): boolean {
    return (this._panelVisibility === visibility);
  }

  get showPanelTitle(): boolean {
    return this._showPanelTitle;
  }

  get lineHeight(): number {
    return this._lineHeight;
  }

  get fontFamily(): string {
    return this._fontFamily;
  }

  get fontSize(): string {
    return this._fontSize;
  }

  get background(): string {
    return this._background;
  }

  get keyBackground(): string {
    return this._keyBackground;
  }

  get valueBackground(): string {
    return this._valueBackground;
  }

  get foreground(): string {
    return this._foreground;
  }

  get dividerColor(): string {
    return this._dividerColor;
  }

  get listStyleType(): string {
    return this._listStyleType;
  }

  //#endregion

  //#region GLOBAL VALUES

  get monospaceFontFamily(): Promise<string> {
    return joplin.settings.globalValue('style.editor.monospaceFontFamily');
  }

  //#endregion

  /**
   * Register settings section with all options and intially read them at the end.
   */
  async register() {
    // settings section
    await joplin.settings.registerSection('yaml.fm.settings', {
      label: 'Front Matter',
      iconName: 'fas fa-info-circle'
    });

    // private settings
    // none

    // general settings
    await joplin.settings.registerSetting('panelVisibility', {
      value: this._panelVisibility,
      type: SettingItemType.Int,
      section: 'yaml.fm.settings',
      isEnum: true,
      public: true,
      options: {
        '0': 'Always',
        '1': 'Automatic'
      },
      label: 'Panel visibility',
      description: "Choose whether the panel should always be visible or only when the selected note contains valid YAML front matter data."
    });
    await joplin.settings.registerSetting('showPanelTitle', {
      value: this._showPanelTitle,
      type: SettingItemType.Bool,
      section: 'yaml.fm.settings',
      public: true,
      label: 'Show panel title',
      description: "Display 'FRONT MATTER' title on the panel. Including additional buttons."
    });
    await joplin.settings.registerSetting('lineHeight', {
      value: this._lineHeight,
      type: SettingItemType.Int,
      section: 'yaml.fm.settings',
      public: true,
      minimum: 20,
      label: 'Line height (px)',
      description: 'Line height of one data entry.'
    });

    // advanced settings
    await joplin.settings.registerSetting('fontFamily', {
      value: this._fontFamily,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Font family',
      description: "Font family used in the panel. Font families other than 'default' must be installed on the system. If the font is incorrect or empty, it might default to a generic sans-serif font. (default: Roboto)"
    });
    await joplin.settings.registerSetting('fontSize', {
      value: this._fontSize,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Font size',
      description: "Font size used in the panel. Values other than 'default' must be specified in valid CSS syntax, e.g. '13px'. (default: App default font size)"
    });
    await joplin.settings.registerSetting('mainBackground', {
      value: this._background,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Background color',
      description: 'Main background color of the panel. (default: Note background color)'
    });
    await joplin.settings.registerSetting('keyBackground', {
      value: this._keyBackground,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Key background color',
      description: 'Background color for data keys. (default: Note list background color)'
    });
    await joplin.settings.registerSetting('valueBackground', {
      value: this._valueBackground,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Value background color',
      description: 'Background color for data values. (default: Note background color)'
    });
    await joplin.settings.registerSetting('mainForeground', {
      value: this._foreground,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Foreground color',
      description: 'Foreground color used for text and icons. (default: Note font color)'
    });
    await joplin.settings.registerSetting('dividerColor', {
      value: this._dividerColor,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'Divider color',
      description: 'Color of the divider between the data entries. (default: App default border color)'
    });
    await joplin.settings.registerSetting('listStyleType', {
      value: this._listStyleType,
      type: SettingItemType.String,
      section: 'yaml.fm.settings',
      public: true,
      advanced: true,
      label: 'List style type',
      description: "Specify the prefix for list item values (sequences). Enter a valid CSS value for list-style-type (e.g. disc, none, lower-roman, ...) or any characters in single quotes (e.g. '- ')."
    });

    // initially read settings
    await this.read();
  }

  private async getOrDefault(event: ChangeEvent, localVar: any, setting: string, defaultValue?: string): Promise<any> {
    const read: boolean = (!event || event.keys.includes(setting));
    if (read) {
      const value: string = await joplin.settings.value(setting);
      if (defaultValue && value.match(this._defaultRegExp)) {
        return defaultValue;
      } else {
        return value;
      }
    }
    return localVar;
  }

  /**
   * Update settings. Either all or only changed ones.
   */
  async read(event?: ChangeEvent) {
    this._panelVisibility = await this.getOrDefault(event, this._panelVisibility, 'panelVisibility');
    this._showPanelTitle = await this.getOrDefault(event, this._showPanelTitle, 'showPanelTitle');
    this._lineHeight = await this.getOrDefault(event, this._lineHeight, 'lineHeight');
    this._fontFamily = await this.getOrDefault(event, this._fontFamily, 'fontFamily', SettingDefaults.FontFamily);
    this._fontSize = await this.getOrDefault(event, this._fontSize, 'fontSize', SettingDefaults.FontSize);
    this._background = await this.getOrDefault(event, this._background, 'mainBackground', SettingDefaults.Background);
    this._keyBackground = await this.getOrDefault(event, this._keyBackground, 'keyBackground', SettingDefaults.KeyBackground);
    this._valueBackground = await this.getOrDefault(event, this._valueBackground, 'valueBackground', SettingDefaults.Background);
    this._foreground = await this.getOrDefault(event, this._foreground, 'mainForeground', SettingDefaults.Foreground);
    this._dividerColor = await this.getOrDefault(event, this._dividerColor, 'dividerColor', SettingDefaults.DividerColor);
    this._listStyleType = await this.getOrDefault(event, this._listStyleType, 'listStyleType', SettingDefaults.ListStyleType);
  }
}
