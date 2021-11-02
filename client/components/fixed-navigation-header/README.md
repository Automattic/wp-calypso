# FixedNavigationHeader (JSX)

This component displays a header with navigation items. 
It can also include children items which will be positioned to the far right.

## How to use

```js
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

const navigationItems = [
	{ text: this.props.translate( 'Plugins' ), path: `/plugins` },
	{
		text: this.props.translate( 'Search' ),
		path: `/plugins?s=woo`,
	},
];

function render() {
	return <FixedNavigationHeader navigationItems={ navigationItems }>Children Item</FixedNavigationHeader>;
}
```

## Props

- `navigationItems` (`{ text: string; path: string }[]`) - The Navigations items to be shown
- `brandFont` (`bool`) - use the WP.com brand font for `navigationItems`
- `id` (`string`) - ID for the header (optional)
- `className` (`string`) - A class name for the wrapped component (optional)
- `children` (`nodes`) – Any children elements which are being rendered to the far right (optional)
