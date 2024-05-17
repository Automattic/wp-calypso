# Site (JSX)

This component displays a Site item using site data retrieved from Redux store. See the documentation for the `siteId` and `site` props for more details about retrieving the site data.

## How to use

```js
import Site from 'calypso/blocks/site';

function render() {
	return <Site siteId={ siteId } indicator />;
}
```

## Props

- `siteId (number)` - A site ID. Required, unless a `site` object prop is provided (see below).
- `site (object)` - A site object. Required, unless a `siteId` prop is provided. If both are provided, `siteId` takes precedence.
- `indicator (bool)` - Whether to display the Site Indicator within the item or not.
- `onSelect (func)` - A function to handle the event callback when clicking/tapping on the site.
- `href (string)` - A URL to add to the anchor.
- `isSelected (bool)` - Whether the site should be marked as selected.
- `homeLink (bool)` - Whether the site should behave as a link to the site home URL
- `showHomeIcon (bool)` - Whether to show a 'home' icon if homeLink is enabled
