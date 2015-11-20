All Sites (JSX)
===============

This component displays the All Sites item. It's used in the Sidebar as the current site selection and in the picker.

#### How to use:

```js
var AllSites = require( 'my-sites/all-sites' );

render: function() {
	return (
		<AllSites sites={ sitesListObject } />
	);
}
```

#### Props

* `sites (object)` - An instance of `sites-list`. It's required.
* `onSelect (func)` - A function to handle the event callback when clicking/tapping on the site.
* `href (string)` - A URL to add to the anchor.
* `isSelected (bool)` - Whether the site should be marked as selected.