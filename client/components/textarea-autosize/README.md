Textarea Autosize
=================

`<TextareaAutosize />` is a drop-in replacement for a `<textarea />` element which automatically grows or shrinks to accommodate its content.

## Usage

Since it is a drop-in replacement, use as you would a regular `<textarea />` element.

```jsx
import TextareaAutosize from 'components/textarea-autosize';

export default function MyForm( { onTextareaChange } ) {
	return (
		<TextareaAutosize
			onChange={ onTextareaChange }
			rows="1" />
	);
}
```

## Props

This component passes all props to the rendered `<textarea />` and does not accept any additional props of its own.
