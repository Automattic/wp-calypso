Current Site (JSX)
==================

This component displays the currently selected site. It's used in the My Sites Sidebar.

#### How to use:

```js
var CurrentSite = require( 'my-sites/current-site' );

render: function() {
	return (
		<CurrentSite sites={ sitesListObject } />
	);
}
```

#### Props

* `sites (object)` - (required) An instance of `sites-list`.
