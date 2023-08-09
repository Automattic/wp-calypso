# NavigationHeader (TSX)

Note: This will eventually replace FixedNavigationHeader.
This component displays a header with a breadcrumb.
It can also include children items which will be positioned to the far right.

## How to use

```js
import NavigationHeader from 'calypso/components/navigation-header';

const navigationItems = [
	{ label: 'Plugins', href: `/plugins` },
	{ label: 'Search', href: `/plugins?s=woo` },
];

function render() {
	return <NavigationHeader navigationItems={ navigationItems }>Children Item</NavigationHeader>;
}
```

## Props

- `navigationItems` (`{ label: string; href: string }[]`) - The Navigations items to be shown
- `id` (`string`) - ID for the header (optional)
- `className` (`string`) - A class name for the wrapped component (optional)
- `children` (`nodes`) – Any children elements which are being rendered to the far right (optional)
- `compactBreadcrumb` (`boolean`) - Displays only the previous item URL reading "Back" in the breadcrumb (optional)
