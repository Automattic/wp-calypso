# FixedNavigationHeader (JSX)

This component displays a header with navigation items. 
It can also include children items which will be positioned to the far right.

## How to use

```js
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

function render() {
	return <FixedNavigationHeader headerText="A main title">Children Item</FixedNavigationHeader>;
}
```

## Props

- `headerText` (`string`) - The main header text
- `brandFont` (`bool`) - use the WP.com brand font for `headerText`
- `id` (`string`) - ID for the header (optional)
- `className` (`string`) - A class name for the wrapped component (optional)
- `children` (`nodes`) – Any children elements which are being rendered to the far right (optional)
