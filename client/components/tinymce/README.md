## TinyMCE

**Note: This is a legacy component that is no longer in use, and is in the process of being removed.**

The `<TinyMCE />` React component is a wrapper around the [TinyMCE](http://www.tinymce.com/) WYWIWYG editor. This folder also contains all of the TinyMCE plugins currently in use by the Calypso project. TinyMCE is relied upon by the editor page, and its implementation is heavily influenced by its usage there. Many plugins and styles have been adapted for use in Calypso from the core WordPress project.

## Upgrading `tinymce`

When upgrading the version of `tinymce` in `package.json`, be sure to also
update the TinyMCE skin files pulled from the Calypso repo. Here's how:

- Upgrade the TinyMCE package in `node_modules/tinymce`
- Update the skin files in the `static/` directory in Calypso:

```sh
git rm -r static/tinymce/skins/lightgray/
cp -r node_modules/tinymce/skins/lightgray static/tinymce/skins/
git add static/tinymce/skins/lightgray/
```

- Commit any changes to the `static/` directory along with the upgrade
- Make sure the Calypso editor is loading `skin.min.css` and `content.min.css`
  from `/calypso/`, which corresponds to the `static/` directory in the repo:
  - `http://calypso.localhost:3000/calypso/tinymce/skins/lightgray/skin.min.css`
    (local development)
  - `https://wordpress.com/calypso/tinymce/skins/lightgray/skin.min.css`
    (staging)

In the future, it would be nice to not have this manual copy step. Ideas and
PRs welcome, but for now, it's probably not a good idea to update these files
outside of a TinyMCE upgrade.

## Usage

```jsx
class MyComponent extends React.Component {
	render() {
		return <TinyMCE mode="tinymce" />;
	}
}
```

## Methods

### `getContent( args: object )`

Retrieves the current content of the editor. In `tinymce` mode, returns the value of the TinyMCE editor [`getContent` function](http://www.tinymce.com/wiki.php/api4:method.tinymce.Editor.getContent). In `html` mode, returns the current value of the `<textarea>` element.

### `isDirty()`

Returns the result of the TinyMCE editor [`isDirty` function](http://www.tinymce.com/wiki.php/api4:method.tinymce.Editor.isDirty).

### `setEditorContent( content: string )`

Sets the content of the editor to the passed string value. This resets the current TinyMCE undo stack and therefore should only be used in initializing the contents of the editor.

## Props

Many TinyMCE events can be hooked by passing its equivalent event name from the list below as a prop function:

- `onActivate`
- `onBlur`
- `onChange`
- `onInput`
- `onKeyUp`
- `onDeactivate`
- `onFocus`
- `onHide`
- `onInit`
- `onRedo`
- `onRemove`
- `onReset`
- `onShow`
- `onSubmit`
- `onUndo`
- `onSetContent`

Other props are defined in detail below:

| property             | type                           | required | default     | comment                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------ | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`               | String (`"tinymce"`, `"html"`) | no       | `"tinymce"` | The editor can be toggled between two modes, `tinymce` and `html`. The `tinymce` mode will be rendered as the visual WYSIWYG editor. The `html` mode is rendered as a `<textarea>` element.                                                                                                                                                                                                                                                  |
| `isNew`              | Boolean                        | no       | `false`     | Controls whether the editor instance should be autofocused when initialized.                                                                                                                                                                                                                                                                                                                                                                 |
| `tabIndex`           | Number                         | no       | `null`      | Controls the `tabindex` attribute of both the TinyMCE visual editor and the `<textarea>` element.                                                                                                                                                                                                                                                                                                                                            |
| `onTextEditorChange` | Function                       | no       | `null`      | If defined, a function to be triggered when the contents of the `<textarea>` element change.                                                                                                                                                                                                                                                                                                                                                 |
| `onTogglePin`        | Function                       | no       | `null`      | If defined, a function to be triggered when the visual editor toolbar is pinned to the top of the screen. Currently, any instance of `<TinyMCE />` is hard-coded to pin its toolbar to the top of the viewport on larger displays when the Calypso master bar bumps against the top of the toolbar. The function should expect to be passed a string argument, `"pin"` or `"unpinned"`, when the toolbar is pinned or unpinned respectively. |

## Plugins

### `advanced`

Manages the visibility of and preference for the second configured toolbar, also referred to as the "kitchen sink". By default, less common actions are not shown and must be toggled by user action. This preference is persisted to the user and is restored upon each visit to the editor.

### `calypso-alert`

A Calypso-styled substitute for the [TinyMCE `alert` dialog](http://www.tinymce.com/wiki.php/api4:method.tinymce.ui.MessageBox.alert).

### `editor-button-analytics`

Monitors and tracks clicks to editor toolbar buttons.

### `media`

Encapsulates all behavior related to the Calypso media library experience. See [plugin documentation](plugins/media/README.md) for more information.

### `tabindex`

Adds support for `tabindex` attribute on the TinyMCE editor.

### `touch-scroll-toolbar`

Adds support for horizontal scroll on overflowed toolbar contents, specifically adding support for touch devices which would otherwise trigger a toolbar button's action immediately upon the first detected touch.

### `wpcom`

An adapted version of the [WordPress Core `wordpress` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/4.3.1/wp-includes/js/tinymce/plugins/wordpress/plugin.js).

### `wpcom-autoresize`

An adapted version of the [WordPress Core `wpautoresize` TinyMCE plugin](https://github.com/WordPress/WordPress/tree/4.3.1/wp-includes/js/tinymce/plugins/wpautoresize/plugin.js).

### `wpcom-charmap`

Adds a "Character Map" TinyMCE button. Upon click, renders a dialog listing a set of common special characters, which can be inserted directly to the editor contents upon selection.

### `wpcom-help`

Adds a "Help" TinyMCE button. Upon click, renders a dialog detailing supported keyboard shortcuts.

### `wpcom-track-paste`

Tracks paste events in the editor.

### `wpcom-view`

A heavily adapted version of the [WordPress Core `wpview` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/4.3.1/wp-includes/js/tinymce/plugins/wpview/plugin.js). While much of the behavior is the same as the plugin from which it was based upon, the rendering of the views leverages React components.

### `wpeditimage`

An adapted version of the [WordPress Core `wpeditimage` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/4.3.1/wp-includes/js/tinymce/plugins/wpeditimage/plugin.js). Many features of the original plugin have been disabled in favor of the [`media` plugin](plugins/media/README.md) offerings.

### `wplink`

A heavily adapted version of the [WordPress Core `wplink` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/4.3.1/wp-includes/js/tinymce/plugins/wplink/plugin.js). While much of the behavior is the same as the plugin from which it was based upon, the rendering of the dialog leverages React components.

### `wptextpattern`

An adapted version of the [WordPress Core `wptextpattern` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/4.3.1/wp-includes/js/tinymce/plugins/wptextpattern/plugin.js).
