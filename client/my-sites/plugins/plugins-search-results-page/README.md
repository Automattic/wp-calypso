# Plugins Search Results Page

This component renders the plugins searcha results page.

## How to use

```js
import PluginsSearchResultsPage from 'calypso/my-sites/plugins/plugins-search-results-page';

function render() {
	return (
		<div>
			<PluginsSearchResultsPage
				search={ search }
				siteSlug={ siteSlug }
				siteId={ siteId }
				sites={ sites }
			/>
		</div>
	);
}
```

## Props

- `siteSlug`: a string containing the slug of the selected site
- `sites`: a sites-list object
- `siteId`: a number containing the current site id.
- `search`: a string with the current search term, if exists
