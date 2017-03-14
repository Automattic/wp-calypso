Site Indicator
==============

This component is used to display a round badge next to a site with information about updates available, connection issues with Jetpack, whether a site is Jetpack, upgrades expiring soon, etc. It takes `siteId` int as property.

#### How to use

```js
var SiteIndicator = require( 'blocks/site-indicator' );

render: function() {
    return(
        <SiteIndicator siteId={ 123 } />
    );
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Int</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The siteId object. 

