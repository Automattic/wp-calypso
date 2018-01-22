Editor Fieldset
===============

Editor Fieldset is a React component to wrap a set of related options under a single grouping with a header.

## Usage

The `<EditorFieldset />` component accepts a single `legend` prop to specify the heading text. Each child of the rendered component is treated and styled as a single option in the group.

```jsx
import React from 'react';
import EditorFieldset from 'post-editor/editor-fieldset';

class MyComponent extends React.Component {
	render() {
		return (
			<EditorFieldset legend="Settings">
				<label><input type="checkbox"> Option One</label>
				<label><input type="checkbox"> Option Two</label>
			</EditorFieldset>
		);
	}

}
```

## Props

### `legend`

A string or React Element to be rendered as the group heading.
