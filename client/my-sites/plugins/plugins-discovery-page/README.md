# Plugins Discovery Page

This component renders the plugins browser discovery page.

## How to use

```js
import PluginsDiscoveryPage from 'calypso/my-sites/plugins/discovery-page';

function render() {
    return (
        <div>
            <PluginsDiscoveryPage
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
