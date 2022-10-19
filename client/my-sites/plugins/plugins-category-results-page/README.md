# Plugins Category Results Page

This component renders the plugins browser category results page.

## How to use

```js
import PluginsCategoryResultsPage from 'calypso/my-sites/plugins/plugins-category-results-page';

function render() {
	return (
		<div>
			<PluginsCategoryResultsPage
				clearSearch={ clearSearch }
				search={ search }
				category={ category }
				sites={ sites }
				searchTitle={ searchTitle }
				siteSlug={ siteSlug }
				siteId={ siteId }
				jetpackNonAtomic={ jetpackNonAtomic }
				selectedSite={ selectedSite }
				sitePlan={ sitePlan }
				isVip={ isVip }
			/>
		</div>
	);
}
```

## Props

- `site`: a string containing the slug of the selected site
- `sites`: a sites-list object
- `category`: a string with the current selected category
- `search`: a string with the current search term, if exists
- `path`: a string with the current url path
