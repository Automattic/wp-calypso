# Plugins Browser List

This component is used to display a list with the a parametrizable number of plugins of a certain category of the wordpress.org public plugin directory.

## How to use

```js
import { localize } from 'i18n-calypso';
import PluginsList from 'calypso/my-sites/plugins/plugins-browser-list';

const MyPluginsList = ( { pluginsData, translate } ) => (
	<div>
		<PluginsList
			plugins={ pluginsData }
			title={ translate( 'category name' ) }
			size={ 6 }
			site={ site }
			addPlaceHolders
		/>
	</div>
);

export default localize( MyPluginsList );
```

## Props

- `title`: a string
- `plugins`: a PluginsData object
- `size`: a number, the amount of plugins to be shown
- `site`: a string containing the slug of the selected site
- `addPlaceholders`: if present, indicates that there should placeholders inserted after the real components list
- `extended`: if present, the PluginBrowserElement will contain extended info. Else, it will default to compact
- `variant`: the component can be used with pagination or infinite scroll. This prop controls how to show placeholders when fetching additional data. Defaults to `Fixed`.

  | variant        | behavior                                                                  |
  | -------------- | ------------------------------------------------------------------------- |
  | Fixed          | Only shows the data after the initial fetch                               |
  | Paginated      | Replaces the list with placeholders while the next page is loading        |
  | InfiniteScroll | Appends placeholder at the end of the list while the next page is loading |
