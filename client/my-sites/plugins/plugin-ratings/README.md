# Plugin Ratings

This component is used to display the detail of how the ratings of a plugin are divided.

## How to use:

```js
import PluginRatings from 'my-sites/plugins/plugin-ratings';

render() {
	return <PluginRatings
			plugin={ this.props.plugin }
			barWidth={ 100 }
		/>;
}
```

## Props

- `plugin`: A plugin object
- `barWidth`: Width in pixels for the percentage bars of the component
