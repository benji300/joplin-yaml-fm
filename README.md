# Joplin YAML Front Matter

YAML Front Matter is a plugin to extend the UX and UI of [Joplin's](https://joplinapp.org/) desktop application.

It allows to display YAML front matter metadata of the selected note in a separate panel.

> :warning: **CAUTION** - Requires Joplin **v1.7.10** or newer

## Features

- Display YAML front matter metadata from selected note in a separate panel
- Support two [additional identifying tokens](#additional-identifying-tokens) for front matter
- Display YAML syntax errors on panel
- Toggle panel visibility (configurable)
  - Manually via command
  - Automatically if selected note contains front matter or not
- [Configurable](#user-options) style attributes

## Installation

### Automatic (Joplin v1.6.4 and newer)

- Open Joplin and navigate to `Tools > Options > Plugins`
- Search for the plugin name and press install
- Restart Joplin to enable the plugin
- By default the panel will appear on the right side of the screen, see how to [place the panel](#place-the-panel)

### Manual

- Download the latest released JPL package (`*.jpl`) from [here](https://github.com/benji300/joplin-yaml-fm/releases)
- Open Joplin and navigate to `Tools > Options > Plugins`
- Press `Install plugin` and select the previously downloaded `jpl` file
- Confirm selection
- Restart Joplin to enable the plugin
- By default the panel will appear on the right side of the screen, see how to [place the panel](#place-the-panel)

### Uninstall

- Open Joplin and navigate to `Tools > Options > Plugins`
- Search for the plugin name and press `Delete` to remove the plugin completely
  - Alternatively you can also disable the plugin by clicking on the toggle button
- Restart Joplin

## Usage

### Place the panel

By default the panel will be on the right side of the screen, this can be adjusted by:

- `View > Change application layout`
- Use the arrow keys (the displayed ones, not keyboard keys) to move the panel at the desired position
- Move the splitter to reach the desired height/width of the panel
- Press `ESC` to save the layout and return to normal mode

### Create front matter data

- Add a block enclosed by three hyphens (`---`) to the note content
  - Or use one the [additional identifying tokens](#additional-identifying-tokens)
- The block must start at the very first line of the note content
- This block must contain data in a valid [YAML Syntax](https://learnxinyminutes.com/docs/yaml/)
  - Where the following types are recognized:
    - Scalar types
    - Sequences
    - Collections/Maps (only one level of nesting allowed)

The following front matter block (without the line numbers):

```yaml
1  ---
2  author: Benji300
3  title: My front matter data
4  date: 2021-02-21
5  ---
```

will be rendered to the following in the front matter panel:

TODO <screenshot> nur panel

### Additional Identifying Tokens

Since Joplin interprets lines followed by `---` as headings, the last line of the front matter block may be displayed in an unexpected way.
That's why the plugin supports two additional identifying tokens in addition to the default.
However, these two tokens are not compatible with the front matter "standard" and thus can only be used within Joplin.
Both must also start on the first line and the content must also be YAML.

#### Fenced code block

The code block start token must contain the `yaml` syntax notation.

````yaml
1  ```yaml
2  author: Benji300
3  title: My front matter data
4  date: 2021-02-21
5  ```
````

TODO screenshot (split screen)

#### HTML Comment

The comment start token must be followed by `yaml`.

```yaml
1  <!--yaml
2  author: Benji300
3  title: My front matter data
4  date: 2021-02-21
5  -->
```

TODO screenshot (split screen)

### Examples

#### Links

The plugin also supports clickable links in the front matter panel.
To enable this, links must be specified in one of the following formats.

> Currently, markdown links must be enclosed by double quotes.

> On click the links will be opened with the default app (e.g. Browser).

````yaml
1  ```yaml
2  plain-links: https://github.com/benji300/joplin-yaml-fm
3  # markdown links
4  external: "[Joplin App](https://joplinapp.org/)"
5  internal: "[Another Note](:/1b10f054b15440878f34401fb48df38e)"
6  ```
````

TODO screenshot

#### Booleans

TODO booleans (fenced)

#### Many values

TODO code block + screenshot of many different values (default ---)

#### YAML Error

TODO Erroneous yaml syntax

## Commands

This plugin provides additional commands as described in the following table.

| Command Label                        | Command ID             | Description                                                               | Menu contexts                           |
| ------------------------------------ | ---------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| Refresh front matter panel           | `yamlRefresh`          | Refresh YAML front matter panel with data from the current selected note. | `Tools>Front Matter`, `Command palette` |
| Toggle front matter panel visibility | `yamlToggleVisibility` | Toggle panel visibility.                                                  | `Tools>Front Matter`, `Command palette` |

### Keyboard shortcuts

Keyboard shortcuts can be assigned in user options via `Options > Keyboard Shortcuts` to all [commands](#commands) which are assigned to the `Tools>Front Matter` menu context.
In the keyboard shortcut editor, search for the command label where shortcuts shall be added.

## User options

This plugin adds provides user options which can be changed via `Options > Front Matter`.

> **NOTE** - If `default` is set for an advanced style setting, the corresponding default color, font family, etc. will be used to match the common App look.

## Feedback

- :question: Need help?
  - Ask a question on the [Joplin Forum](https://discourse.joplinapp.org/c/plugins/18) (TODO: Paste link to thread)
- :bulb: An idea to improve or enhance the plugin?
  - Start a new discussion on the [Forum](https://discourse.joplinapp.org/t/plugin-yaml-fm/12752) or upvote [popular feature requests](https://github.com/benji300/joplin-yaml-fm/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement+sort%3Areactions-%2B1-desc+)
- :bug: Found a bug?
  - Check the [Forum](https://discourse.joplinapp.org/t/plugin-yaml-fm/12752) if anyone else already reported the same issue. Otherwise report it by yourself.

## Support

You like this plugin as much as I do and it improves your daily work with Joplin?

Then I would be very happy if you buy me a :beer: or :coffee: via [PayPal](https://www.paypal.com/donate?hosted_button_id=6FHDGK3PTNU22) :wink:

## Development

The npm package of the plugin can be found [here](https://www.npmjs.com/package/joplin-plugin-yaml-fm).

### Building the plugin

If you want to build the plugin by your own simply run `npm run dist`.

### Updating the plugin framework

To update the plugin framework, run `npm run update`.

## Changes

See [CHANGELOG](./CHANGELOG.md) for details.

## License

Copyright (c) 2021 Benjamin Seifert

MIT License. See [LICENSE](./LICENSE) for more information.
