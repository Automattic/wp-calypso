# Plugin Site List

This component is used to represent a list of `Plugin-Site`, with a `Section-Header` serving as a title for the whole bunch.

## How to use

```jsx
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';

return (
	<PluginSiteList
		sites={ sites }
		plugin={ this.state.plugin }
		notices={ this.state.notices }
		title={ title }
	/>
);
```

## Props

- `sites`: (array) a site object array with the sites to show in the list
- `plugin`: a plugin data object.
- `notices`: a notices object
- `title` (string) the title to appear in the header
