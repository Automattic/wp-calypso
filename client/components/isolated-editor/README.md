# Isolated Block Editor

Repackages Gutenberg's editor playground as multi-instance editor:

- Multiple instances with seperate data stores and keyboard handlers
- Undo history
- Works at sizes smaller than full screen
- Patterns, reusable blocks, groups, and template support
- Block inserter in a popover
- Block inspector in a popover
- Re-routing of WordPress API requests
- Preferences (saved to localStorage) and options (saved to memory), per instance
- Block allow and disallow list, per instance
- Overriding of key Gutenberg store functions
- Built in toolbar with options for displaying a more menu, block inspector, and block buttons
- PHP (WordPress) code to load the editor outside of wp-admin
- Menu for custom links
- Fullscreen mode (requires additional CSS)
- Preview mode (requires additional CSS and JS)
- Visual & code editor

If multiple editors are on-screen then the IsolatedBlockEditor will ensure that the `wp` global refers to the currently focussed instance. This should make it more compatible with plugins and third-party
code that uses the `wp` global.

It is possible for each editor instance to have a seperate list of available blocks.

## Usage

Include the IsolatedBlockEditor module and then create an instance:

```js
render(
	<IsolatedBlockEditor
		settings={ settings }
		onSaveContent={ ( html ) => saveContent( html ) }
		onLoad={ ( parse ) => loadInitialContent( parse ) }
		onError={ () => document.location.reload() }
	>
	</IsolatedBlockEditor>,
	document.querySelector( '#render' )
);
```

## Props

### settings

- _iso_ `[object]` - IsolatedBlockEditor settings object
- _iso.preferencesKey_ `[string|null]` - Preferences key. Default to null to disable
- _iso.defaultPreferences_ {object} - Default preferences
- _iso.persistenceKey_ `[string|null]` - Persistence key. Default to null to disable
- _iso.blocks_ `[object]` - Block restrictions
- _iso.blocks.allowBlocks_ `[string[]]` - list of block names to allow, defaults to none
- _iso.blocks.disallowBlocks_ `[string[]]` - list of block names to disallow, defaults to none
- _iso.disallowEmbed_ `[string[]]`  - List of embed names to remove, defaults to none.
- _iso.toolbar_ `[Object]` - Toolbar settings
- _iso.toolbar.inserter_ `[boolean]` - Enable or disable the toolbar block inserter, defaults to `true`
- _iso.toolbar.inspector_ `[boolean]` - Enable or disable the toolbar block inspector, defaults to `false`
- _iso.toolbar.navigation_ `[boolean]` - Enable or disable the toolbar navigation button, defaults to `false`
- _iso.toolbar.toc_ `[boolean]` - Enable or disable the toolbar table of contents button, defaults to `false`
- _iso.toolbar.undo_ `[boolean]` - Enable or disable the toolbar undo/redo buttons, defaults to `true`
- _iso.moreMenu_ `[Object]` - More menu settings
- _iso.moreMenu.editor_ `[boolean]` - Enable or disable the editor sub menu (visual/code editing), defaults to `false`
- _iso.moreMenu.fullscreen_ `[boolean]` - Enable or disable the fullscreen option, defaults to `false`
- _iso.moreMenu.preview_ `[boolean]` - Enable or disable the preview option, defaults to `false`
- _iso.moreMenu.topToolbar_ `[boolean]` - Enable or disable the 'top toolbar' option, defaults to `false`
- _iso.linkMenu_ `[array]` - Link menu settings. Array of `title` and `url`, defaults to none
- _iso.currentPattern_ `[string]` - The pattern to start with, defaults to none
- _iso.allowApi_ `[boolean]` - Allow API requests, defaults to `false`
- _editor_ `[object]` - Gutenberg settings object

A settings object that contains all settings for the IsolatedBlockEditor, as well as for Gutenberg. Any settings not provided will use defaults.

The block allow and disallow list works as follows:
- All blocks are allowed, unless the `allowBlocks` option is set which defines the list of allowed blocks
- Anything in the `disallowBlocks` list is removed from the list of allowed blocks.

### onSaveContent

- _content_ - content to be saved, as an HTML string

Save callback that saves the content as an HTML string. Will be called for each change in the editor content.

### onSaveBlocks

- _blocks_ `[Array]` - blocks to be saved
- _ignoredContent_ `[Array]`- array of HTML strings of content that can be ignored

Save callback that is supplied with a list of blocks and a list of ignored content. This gives more control than `onSaveContent`, and is used if you want to filter the saved blocks. For example,
if you are using a template then it will appear in the `ignoredContent`, and you can then ignore the `onSaveBlocks` call if it matches the `blocks`.

### onLoad

- _parse_ `[string]` - Gutenberg `parse` function that parses HTML as a string and returns blocks

Load the initial content into the editor. This is a callback that runs after the editor has been created, and is supplied with a `parse` function that is specific to this editor instance. This should
be used so that the appropriate blocks are available.

### onError

Callback if an error occurs.

### className

Additional class name attached to the editor.

### renderMoreMenu

- _menuSettings_ `[object]` - settings for this particular editor
- _onClose_ `[func]` - Callback to close the more menu

Render additional components in the more menu.

Note: this needs improving or replacing with something more flexible

### children

Add any components to customise the editor. These components will have access to the editor's Redux store.

## Developing

Specific custom behaviour can be added through child components. These components will have access to the `isolated/editor` store, as well as to the editor instance versions of `core/block-editor`.
