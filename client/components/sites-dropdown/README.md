# Sites Dropdown

Renders a dropdown component for selecting a site. This is the canonical site picker component for using whenever you need to offer users a site selection flow.

It supports searching if you have many sites, handles sites with empty titles, sites with redirects, etc.

## How to use

```js
import SitesDropdown from 'calypso/components/sites-dropdown';

function render() {
	return <SitesDropdown />;
}
```

## Props

(All optional)

- `selectedSiteId` (`number`) — Id of the initial selected site
- `onClose` (`function`) — called on site selection
- `onSiteSelect` (`function`) - called with the site's `ID` on site selection
- `filter` (`function`) - If present, passed to `sites.filter()` to display a subset of sites. Return `true` to display a site.
- `isPlaceholder` (`bool`) - `true` to display as a placeholder
