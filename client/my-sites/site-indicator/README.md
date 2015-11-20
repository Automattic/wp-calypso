Site Indicator
==============

This component is used to display a round badge next to a site with information about updates available, connection issues with Jetpack, whether a site is Jetpack, upgrades expiring soon, etc. It takes `site` object as property.

#### How to use

```js
var SiteIndicator = require( 'my-sites/site-indicator' );

render: function() {
    return(
        <SiteIndicator site={ siteObject } />
    );
}
```
