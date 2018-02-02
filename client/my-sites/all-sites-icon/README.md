All Sites Icon
==============

This component is used to display a composite grid of site icons from the user's sites. It takes the sites-list instance object as a prop.

#### How to use:

```js
import AllSitesIcon from 'my-sites/all-sites-icon';

render() {
	return (
		<div className="your-stuff">
			<AllSitesIcon sites={ sitesList } />
		</div>
	);
}
```

#### Props

* `sites (Array)` - An array of sites (required).
