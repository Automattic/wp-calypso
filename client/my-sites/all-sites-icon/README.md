All Sites Icon
==============

This component is used to display a composite grid of site icons from the user's sites. It takes the sites-list instance object as a prop.

#### How to use:

```js
var AllSitesIcon = require( 'my-sites/all-sites-icon' );

render: function() {
	return (
		<div className="your-stuff">
			<AllSitesIcon sites={ sitesList } />
		</div>
	);
}
```

#### Props

* `sites (Array)` - An array of sites (required).
