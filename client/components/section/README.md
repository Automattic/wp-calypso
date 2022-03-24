# Section (TSX)

This component displays a section with a header and children elements as content.

## How to use

```js
import Section from 'calypso/components/section';

function render() {
	return <Section header={ header }>{ content }</Section>;
}
```

## Props

- `header` (`ReactChild`) - The header string or a component to render as the header.
- `children` (`ReactChild | ReactChild[]`) - The content to be rendered inside the section.
- `dark?` (`boolean`) - Makes the background of the section dark.
