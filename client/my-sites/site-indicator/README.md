# Site Indicator

This component is used to display a round badge next to a site with information about updates available, connection issues with Jetpack, whether a site is Jetpack, upgrades expiring soon, etc. It takes `site` object as property.

## How to use

```js
import SiteIndicator from 'calypso/my-sites/site-indicator';

function render() {
	return <SiteIndicator site={ siteObject } />;
}
```

## Props

### `site`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site object.

### `onSelect`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>
