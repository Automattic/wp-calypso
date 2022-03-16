# Feature Item (TSX)

This component displays a component with a title and text content.

## How to use

```js
import FeatureItem from 'calypso/components/feature-item';

function render() {
	return <FeatureItem header={header}> Content goes here </FeatureItem>;
}
```

## Props

- `header` (`ReactChild`) - The string rendered in the title of the component.
- `children` (`ReactChild`) - The string rendered in the content of the component.
