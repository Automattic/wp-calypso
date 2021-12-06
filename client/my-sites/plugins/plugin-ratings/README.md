# Plugin Ratings

This component is used to display the detail of how the ratings of a plugin are divided
or just rating stars.

## How to use

```js
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings';

function render() {
	return <PluginRatings plugin={ 90 } />;
}
```

## Props

- `rating`: The plugin rating (0-100)
- `ratings`: An object or array with the Plugin ratings
- `downloaded`: The plugin current downloads number
- `slug`: The Plugin slug
- `numRatings`: The total ratings this plugin has received
