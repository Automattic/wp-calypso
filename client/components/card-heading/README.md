# CardHeading (JSX)

This component displays a heading for a `<Card>`

## How to use

```js
import CardHeading from 'calypso/components/card-heading';

function render() {
	return (
		<CardHeading tagName="h1" size={ 21 }>
			Put your heading text here
		</CardHeading>
	);
}
```

## Props

- `tagName` (`string`) - The element to wrap the text in
- `size` (`int`) - The font size of the heading
- `isBold` (`bool`) - Sets the heading to bold
- `className` (`string`) - Adds additional class names to the component
