import joplin from 'api';
import { Scalar, YAMLMap, YAMLSeq } from 'yaml/types';
import { YAMLError, YAMLWarning, Type } from 'yaml/util';
import { Settings } from './settings';
import { Url } from './url';

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
    this._panel = await joplin.views.panels.create('panel');
    await joplin.views.panels.addScript(this._panel, './webview.css');
    await joplin.views.panels.addScript(this._panel, './webview.js');

    // message handler
    await joplin.views.panels.onMessage(this._panel, async (message: any) => {
      if (message.name === 'refresh') {
        await joplin.commands.execute('yfmRefresh');
      }
      if (message.name === 'openNote') {
        await joplin.commands.execute('openNote', message.value);
      }
      if (message.name === 'openUrl') {
        // try to open the URL in the system's default browser
        Url.open(message.value);
      }
    });

    // set init message
    await joplin.views.panels.setHtml(this._panel, `
      <div id="container" style="background:${this.sets.background};font-family:${this.sets.fontFamily},sans-serif;font-size:${this.sets.fontSize};">
        <div id="fm-container">
          <p>Loading panel...</p>
        </div>
      </div>
    `);
  }

  private getPanelTitleHtml(): string {
    let panelTitleHtml: string = '';

    if (this.sets.showPanelTitle) {
      panelTitleHtml = `
        <div id="fm-title">
          <span class="title" style="color:${this.sets.foreground};">FRONT MATTER</span>
          <div class="controls">
            <span class="fas fa-sync-alt" onclick="message('refresh')" title="Refresh panel"></span>
          </div>
        </div>
      `;
    }
    return panelTitleHtml;
  }

  private escapeHtml(key: any): String {
    return String(key)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  //   {
  //     "name": "YAMLSemanticError",
  //     "message": "Implicit map keys need to be followed by map values at line 10, column 3:\n\n  ojbc\n  ^^^^\n",
  //     "nodeType": "PLAIN",
  //     "range": { "start": 126, "end": 130 },
  //     "linePos": {
  //       "start": { "line": 10, "col": 3 },
  //       "end": { "line": 10, "col": 7 }
  //     }
  //   }
  private getYamlErrorHtml(yerr: YAMLError, type: string, monospaceFontFamily: string): string {
    const msgHtml: string[] = [];
    const msgLines: string[] = String(yerr.message).split(/\n/g);
    msgLines.forEach(msg => { msgHtml.push(`<span>${msg}</span>`) });

    return `
      <p class="alert alert-${type}" style="font-family:'${monospaceFontFamily}',monospace,sans-serif;">
        <span><strong>${yerr.name}:</strong></span>
        ${msgHtml.join('<br>')}
      <p>
    `;
  }

  // print errors and warnings
  private async getYamlErrorsHtml(yaml?: any): Promise<string> {
    const errorsHtml: string[] = [];
    if (yaml) {
      if (yaml.errors.length > 0 || yaml.warnings.length > 0) {
        const monospaceFontFamily: string = await this.sets.monospaceFontFamily;

        yaml.errors.forEach((err: YAMLError) => {
          errorsHtml.push(this.getYamlErrorHtml(err, "error", monospaceFontFamily));
        });
        yaml.warnings.forEach((warn: YAMLWarning) => {
          errorsHtml.push(this.getYamlErrorHtml(warn, "warning", monospaceFontFamily));
        });
      }
    }
    return errorsHtml.join('\n');
  }

  private getLinkHtml(href: string, title: string): string {
    let handlerMsg: string = 'openUrl';
    let value: string = href;
    let tooltip: string = href;

    // check if it is an internal link
    const linkRegEx = /^:\/([0-9a-zA-Z]+)/g;
    const linkMatch: RegExpExecArray = linkRegEx.exec(href);
    if (linkMatch && linkMatch.length > 0) {
      value = linkMatch[1]; // note ID
      tooltip = 'Open Note';
      handlerMsg = 'openNote';
    }

    return `
      <a href="#" data-value="${href}" title="${tooltip}" onclick="openLink(event, '${handlerMsg}')">
        <span>${this.escapeHtml(title)}</span>
      </a>
    `;
  }

  private getScalarHtml(scalar: Scalar): string {
    if (!scalar.value) return '';
    const val: string = scalar.value;

    // check if its a boolean value
    const boolRegEx = /^(true|false)$/gi;
    const boolMatch: RegExpExecArray = boolRegEx.exec(val);
    if (boolMatch && boolMatch.length > 0) {
      const checked: string = (val) ? 'checked' : '';
      return `
        <input type="checkbox" readonly ${checked}></input>
      `;
    }

    // check if its a plain url
    try {
      const plainUrl: URL = new URL(val);
      if (plainUrl && plainUrl.href) {
        return this.getLinkHtml(plainUrl.href, plainUrl.hostname);
      }
    } catch (e) { }

    // check if its a markdown link (external or internal)
    const urlRegEx = /^[\?]?\[(.*)\]\((.*)\)/g;
    const urlMatch: RegExpExecArray = urlRegEx.exec(val);
    if (urlMatch && urlMatch.length > 0) {
      return this.getLinkHtml(urlMatch[2], urlMatch[1]);
    }

    // default: Escape html chars and return simple string value
    return `<span>${this.escapeHtml(val)}</span>`;
  }

  private getSequenceHtml(seq: YAMLSeq): string {
    const itemsHtml: string[] = [];
    seq.items.forEach(x => { itemsHtml.push(`<li>${this.getScalarHtml(x)}</li>`) });

    return `
      <ul style="list-style-type:${this.sets.listStyleType};">
        ${itemsHtml.join('\n')}
      </ul>
    `;
  }

  private getMapHtml(map: YAMLMap) {
    return this.getTableHtml(map.items, 0);
  }

  private getTableRowHtml(item: any, indent?: number): string {
    const value: any = item.value;
    let valueHtml: string = '';

    // TODO identify notes: https://eemeli.org/yaml/#identifying-nodes
    if (value) {
      if (value.type === Type.FLOW_SEQ || value.type === Type.SEQ) { // isSeq(value)
        valueHtml = this.getSequenceHtml(value);
      } else if (value.type === Type.FLOW_MAP || value.type === Type.MAP) {
        valueHtml = this.getMapHtml(value);
      } else {
        // default behavior (QUOTE_DOUBLE,) for strings, numbers, booleans, ...
        valueHtml = this.getScalarHtml(value);
      }
    }

    return `
      <tr>
        <th style="background:${this.sets.keyBackground};border-color:${this.sets.dividerColor};">
          ${this.escapeHtml(item.key.value)}
        </th>
        <td style="background:${this.sets.valueBackground};border-color:${this.sets.dividerColor};">
          ${valueHtml}
        </td>
      </tr>
    `;
  }

  private getTableHtml(items: any[], marginBottom: number): string {
    let tableRows: string[] = [];
    items.forEach(x => { tableRows.push(this.getTableRowHtml(x)) });

    return `
      <table style="color:${this.sets.foreground};margin-bottom:${marginBottom}px;">
        <tbody>
          ${tableRows.join('\n')}
        </tbody>
      </table>
    `;
  }

  private getFmDataHtml(yaml?: any): string {
    if (yaml && yaml.contents.items.length > 0) {
      const marginBottom: number = this.sets.lineHeight * 2;
      return this.getTableHtml(yaml.contents.items, marginBottom);
    }
    return `<p>Selected note does not contain valid YAML front matter data.</p>`;
  }

  /**
   * Update the HTML webview with actual content.
   */
  async updateWebview(yaml?: any) {
    // const selectedNote: any = await joplin.workspace.selectedNote();
    const panelTitleHtml: string = this.getPanelTitleHtml();
    const yamlErrorsHtml: string = await this.getYamlErrorsHtml(yaml);
    const fmDataHtml: string = this.getFmDataHtml(yaml);

    // add entries to container and push to panel
    await joplin.views.panels.setHtml(this._panel, `
      <div id="container" style="background:${this.sets.background};line-height:${this.sets.lineHeight}px;font-family:${this.sets.fontFamily},sans-serif;font-size:${this.sets.fontSize};">
        ${panelTitleHtml}
        <div id="fm-container">
          <div id="fm-inner">
            ${yamlErrorsHtml}
            ${fmDataHtml}
          </div>
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

  /**
   * Set the panel visibility to the handle value, if not already set.
   */
  async forceVisibility(value: boolean) {
    const isVisible: boolean = await joplin.views.panels.visible(this._panel);
    if (isVisible != value) {
      await joplin.views.panels.show(this._panel, (value));
    }
  }
}