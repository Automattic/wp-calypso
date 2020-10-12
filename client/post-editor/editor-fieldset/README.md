# Editor Fieldset

Editor Fieldset is a React component to wrap a set of related options under a single grouping with a header.

## Usage

The `<EditorFieldset />` component accepts a single `legend` prop to specify the heading text. Each child of the rendered component is treated and styled as a single option in the group.

```jsx
import React from 'react';
import EditorFieldset from 'post-editor/editor-fieldset';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';

class MyComponent extends React.Component {
	render() {
		return (
			<EditorFieldset legend="Settings">
				<FormLabel>
					<FormInputCheckbox />
					<span>Option One</span>
				</FormLabel>
				<FormLabel>
					<FormInputCheckbox />
					<span>Option Two</span>
				</FormLabel>
			</EditorFieldset>
		);
	}
}
```

## Props

### `legend`

A string or React Element to be rendered as the group heading.
