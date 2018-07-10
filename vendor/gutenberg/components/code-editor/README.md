CodeEditor
=======

CodeEditor is a React component that provides the user with a code editor
that has syntax highlighting and linting.

The components acts as a drop-in replacement for a <textarea>, and uses the
CodeMirror library that is provided as part of WordPress Core.

## Usage

```jsx
import { CodeEditor } from '@wordpress/components';

function editCode() {
	return (
		<CodeEditor
			value={ '<p>This is some <b>HTML</b> code that will have syntax highlighting!</p>' }
			onChange={ value => console.log( value ) }
		/>
	);
}
```

## Props

The component accepts the following props:

### value

The source code to load into the code editor.

- Type: `string`
- Required: Yes

### focus

Whether or not the code editor should be focused.

- Type: `boolean`
- Required: No

### onFocus

The function called when the editor is focused.

- Type: `Function`
- Required: No

### onChange

The function called when the user has modified the source code via the
editor. It is passed the new value as an argument.

- Type: `Function`
- Required: No

### settings

The settings object used to initialize the WordPress code editor. The object contains all of the settings for the editor, including specific settings for CodeMirror. This object is passed into `wp.codeEditor.initialize()`. If you do not specify a settings object, `window._wpGutenbergCodeEditorSettings` will be used instead.

If you are extending `window._wpGutenbergCodeEditorSettings` make sure to clone the object using `Object.assign` or something similar instead of modifying it directly so the default settings remain the same.

```
const settings = Object.assign(  {
	codemirror: {
		mode: css,
		lint: false,
	} },
	window._wpGutenbergCodeEditorSetting
);
```

- Type: `Object`
- Required: No

### editorRef

A reference to the instance of CodeMirror initialized when the editor is loaded so that it can be dynamically updated from a parent component.

`editorRef={ ( ref ) => this.editorInstance = ref }`

`this.editorInstance` will contain a full instance of `CodeMirror` which can then be modified or updated from the component it is being reference from using the [CodeMirror API](https://codemirror.net/doc/manual.html#api). For example, to dynamically change the language mode of CodeMirror to CSS you can call:

`this.editorInstance.setOption( 'mode', 'css' );`

- Type `Function`
- Required: No
