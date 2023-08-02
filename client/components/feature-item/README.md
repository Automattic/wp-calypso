# Feature Item (TSX)

This component displays a component with a title and text content.

## How to use

```js
import FeatureItem from 'calypso/components/feature-item';

function render() {
	return <FeatureItem header={ header }> Content goes here </FeatureItem>;
}
```

## Props

- `header` (`ReactNode`) - The content rendered in the title of the component.
- `children` (`ReactNode`) - The content to be rendered inside the item.
