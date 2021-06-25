# All Sites (JSX)

This component displays the All Sites item. It's used in the Sidebar as the current site selection and in the picker.

## How to use

```js
import AllSites from 'calypso/blocks/all-sites';

function render() {
	return <AllSites sites={ sitesArray } />;
}
```

## Props

- `sites (array)` - An array of `site` objects.
- `onSelect (func)` - A function to handle the event callback when clicking/tapping on the site.
- `href (string)` - A URL to add to the anchor.
- `isSelected (bool)` - Whether the site should be marked as selected.
- `showCount (bool)` - Whether to render a `<Count>` element.
- `count (number)` - A value to be rendered as the count.
- `title (string)` - To set a different title for the component. Default is "All My Sites".
- `domain (string)` - If this is set it renders a the string as the domain before the row of icons.
