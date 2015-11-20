Editor Fieldset
===============

Editor Fieldset is a React component to wrap a set of related options under a single grouping with a header.

## Usage

The `<EditorFieldset />` component accepts a single `legend` prop to specify the heading text. Each child of the rendered component is treated and styled as a single option in the group.

```jsx
var React = require( 'react' ),
	EditorFieldset = require( 'post-editor/editor-fieldset' );

React.createClass( {
	render: function() {
		return (
			<EditorFieldset legend="Settings">
				<label><input type="checkbox"> Option One</label>
				<label><input type="checkbox"> Option Two</label>
			</EditorFieldset>
		);
	}
} );
```

## Props

### `legend`

A string or React Element to be rendered as the group heading.
