*Navigation Back Button*

This component is used to display a `Back` button for redirection to the previously
visited site.

#Usage:

```js
import NavigationBackButton from 'my-sites/site-settings/navigation-back-button';
...

getRoute() {
	... // return a route
}

<span className="....">
		<NavigationBackButton redirectRoute={ this.getRoute() } { ...this.props } />
</span>

```

#Props (required):

- `redirectRoute` -- destination redirect route (string)

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
- `props` -- used to pass `translate` function to the component
