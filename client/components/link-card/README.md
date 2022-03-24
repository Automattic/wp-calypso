# Link Card (TSX)

This component displays a card with a custom background, a label, a title and cta.
## How to use

```js
import LinkCard from 'calypso/components/link-card';

function render() {
	return <LinkCard background={ background } label={ label } title={ title } cta={ cta } />;
}
```

## Props

- `background` (`string`) - A background color variable name.
- `label` (`ReactChild`) - The string rendered in the top card with the smaller size, it can also be a component.
- `title` (`ReactChild`) - The string rendered in the middle of the card with the larger size, it can also be a component.
- `cta` (`ReactChild`) - The string rendered in the bottom of the card with the middle size, it can also be a component.
- `url` (`string`) - The url the component points to.
