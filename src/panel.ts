import joplin from 'api';
import { Settings } from './settings';
import { Url } from './url';
// import {
//   isMap,
//   isPair,
//   isScalar,
//   isSeq
// } from 'yaml';

export class Panel {
  private _panel: any;
  private _settings: Settings;

  constructor(settings: Settings) {
    this._settings = settings;
  }

  private get sets() {
    return this._settings;
  }

  /**
   * Register plugin panel and update webview for the first time.
   */
  async register() {
    this._panel = await joplin.views.panels.create('yaml.fm.panel');
    await joplin.views.panels.addScript(this._panel, './assets/fontawesome/css/all.min.css');
    await joplin.views.panels.addScript(this._panel, './webview.css');
    await joplin.views.panels.addScript(this._panel, './webview.js');

    // message handler
    await joplin.views.panels.onMessage(this._panel, async (message: any) => {
      if (message.name === 'refresh') {
        // TODO trigger refresh command
      }
      if (message.name === 'openUrl') {
        // try to open the URL in the system's default browser
        Url.open(message.url);
      }
    });

    // set init message
    await joplin.views.panels.setHtml(this._panel, `
      <div id="container" style="background:${this.sets.background};font-family:'${this.sets.fontFamily}',sans-serif;font-size:${this.sets.fontSize};">
        <div id="fm-container">
          <p style="padding-left:8px;">Loading panel...</p>
        </div>
      </div>
    `);
  }

  private escapeHtml(key: String): String {
    // TODO
    return key;
    // return key
    //   .replace(/&/g, "&amp;")
    //   .replace(/</g, "&lt;")
    //   .replace(/>/g, "&gt;")
    //   .replace(/"/g, "&quot;")
    //   .replace(/'/g, "&#039;");
  }

  private getScalarHtml(value: string): string {
    const urlRegEx = /^\[(.*)\]\((.*)\)$/g;
    const urlMatch: RegExpExecArray = urlRegEx.exec(value);

    if (urlMatch && urlMatch.length > 0) {
      return `
        <a href="#" data-url="${urlMatch[2]}" title="${urlMatch[2]}" onclick="openUrl(event)">
          <span>${this.escapeHtml(urlMatch[1])}</span>
        </a>
      `;
    } else {
      // escape html chars and return simple string value
      return `<span>${this.escapeHtml(value)}</span>`;
    }
  }

  private getSequenceHtml(items: any[]): string {
    const itemsHtml: string[] = [];
    items.forEach(x => { itemsHtml.push(`<li>${this.getScalarHtml(x.value)}</li>`) });

    return `
      <ul style="list-style-type:${this.sets.listStyleType};">
        ${itemsHtml.join('\n')}
      </ul>
    `;
  }

  private getMapHtml(items: any[]) {
    // TODO table in value td aufbauen
    // rows.push(this.getRowHtml(item.key.value));
    // for (let i: number = 0; i < item.value.items.length; i++) {
    //   rows.push(this.getRowHtml(item.value.items[i].key, item.value.items[i].value, 1));
    // }
    return 'TODO Map HTML';
  }

  private getRowHtml(item: any, indent?: number): string {
    const value: any = item.value;
    let valueHtml: string = '';

    // TODO identify notes: https://eemeli.org/yaml/#identifying-nodes
    if (value) {
      if (value.type === 'FLOW_SEQ' || value.type === 'SEQ') { // isSeq(value)
        valueHtml = this.getSequenceHtml(item.value.items);
      } else if (value.type === 'MAP') {
        valueHtml = this.getMapHtml(item.value.items);
      } else {
        // default behavior (QUOTE_DOUBLE,) for strings, numbers, booleans, ...
        valueHtml = this.getScalarHtml(value.value);
      }
    }

    return `
      <tr>
        <td class="key" style="background:${this.sets.keyBackground};border-color:${this.sets.dividerColor};">
          ${this.escapeHtml(item.key.value)}
        </td>
        <td class="value" style="background:${this.sets.valueBackground};border-color:${this.sets.dividerColor};">
          ${valueHtml}
        </td>
      </tr>
    `;
  }

  private getYamlDataHtml(yaml?: any) {
    if (yaml) {
      if (yaml.contents.items.length > 0) {
        let tableRows: string[] = [];
        yaml.contents.items.forEach(x => { tableRows.push(this.getRowHtml(x)) });

        return `
          <table style="color:${this.sets.foreground};margin-bottom:${this.sets.lineHeight}px;">
            <tbody>
              ${tableRows.join('\n')}
            </tbody>
          </table>
        `;
      }
    }

    return `<p>Selected note doesn't contain valid YAML Front Matter data.</p>`;
  }

  /**
   * Update the HTML webview with actual content.
   */
  async updateWebview(yaml?: any) {
    // const selectedNote: any = await joplin.workspace.selectedNote();
    const yamlDataHtml: string = await this.getYamlDataHtml(yaml);

    // add entries to container and push to panel
    await joplin.views.panels.setHtml(this._panel, `
      <div id="container" style="background:${this.sets.background};line-height:${this.sets.lineHeight}px;font-family:'${this.sets.fontFamily}',sans-serif;font-size:${this.sets.fontSize};">
        <div id="fm-title">
          <span class="title" style="color:${this.sets.foreground};">FRONT MATTER</span>
          <div class="controls">
            <span class="fas fa-sync-alt" onclick="message('refresh')" title="Refresh panel"></span>
          </div>
        </div>
        <div id="fm-container">
          ${yamlDataHtml}
        </div>
      </div>
    `);
  }

  /**
   * Toggle visibility of the panel.
   */
  async toggleVisibility() {
    const isVisible: boolean = await joplin.views.panels.visible(this._panel);
    await joplin.views.panels.show(this._panel, (!isVisible));
  }
}