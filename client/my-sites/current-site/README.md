Current Site (JSX)
==================

This component displays the currently selected site. It's used in the My Sites Sidebar.

#### How to use:

```js
import CurrentSite from 'my-sites/current-site';

render() {
	return (
		<CurrentSite sites={ sitesListObject } />
	);
}
```

#### Props

* `sites (object)` - (required) An instance of `sites-list`.
