# Footer Section (TSX)

This component displays a footer section with a header and an space for content

## How to use

```js
import FooterSection from 'calypso/components/footer-section';

function render() {
	return <FooterSection header={ header }>{ content }</FooterSection>;
}
```

## Props

- `header` (`ReactChild`) - The header string or a component to render as the header.
- `children` (`ReactChild | ReactChild[]`) - The content to be rendered by the footer section.
