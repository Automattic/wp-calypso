# NavigationHeader (TSX)

This component displays a header with a breadcrumb.
It can also include children items which will be positioned to the far right.
It will not show less than 2 items.

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

- `navigationItems` (`{ label: string; href?: string; helpBubble?: React.ReactElement; onClick?: () => void }[]`) - The Navigations items to be shown
- `id` (`string`) - ID for the header (optional)
- `className` (`string`) - A class name for the wrapped component (optional)
- `children` (`nodes`) – Any children elements which are being rendered to the far right (optional)
- `compactBreadcrumb` (`boolean`) - Displays only the previous item URL reading "Back" in the breadcrumb (optional)
- `title` (`string`) - Title of the header (optional)
- `subtitle` (`string`) - Subtitle of the header (optional)
- `screenReader` (`string`) - Used for screen readers and it's hidden on the view (optional)
