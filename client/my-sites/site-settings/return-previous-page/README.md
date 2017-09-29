Return Previous Page

This component is used to display a `Back` button for redirection to the previously
visited site.

#Usage:

```js
import ReturnPreviousPage from 'my-sites/site-settings/return-previous-page';
...

getRoute() {
	... // return a route
}

<span className="....">
		<ReturnPreviousPage redirectRoute={ this.getRoute() } { ...this.props } />
</span>

```

#Props:

- `getRoute()` is a function returning redirection route loaded in the `onClick`
event of the `Back` button.

##Exemplary use

Redirect to `/settings/manage-connection/:siteSlug`:

```js

getRoute() {
	const { siteSlug } = this.props;

	if ( siteSlug ) {
		return '/settings/manage-connection/' + siteSlug;
	}
}

```
