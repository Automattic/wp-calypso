# Bredcrumb (TSX)

This component displays an array of items as a breadcrumb.
Each item should have at least a label.

## How to use

```js
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

const navigationItems = [
	{ label: 'Plugins', href: `/plugins` },
	{ label: 'Search', href: `/plugins?s=woo` },
];

const mobileItem = {
	label: 'Back',
	href: '/plugins'
	showBackArrow: true,
};


function render() {
	return <Breadcrumb items={ navigationItems } mobileItem={ mobileItem } />;
}
```

## Props

- `items` (`{ label: string; href?: string }[]`) - The Navigations items to be shown
- `mobileItem` (`{ label: string; href?: string, showBackArrow?: boolean }`) - Displays this value on the mobile view
