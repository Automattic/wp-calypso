# Plugin Spotlight

This component renders a plugin spotlight on the top of the list browser.
## How to use

```js
import PluginSpotlight from 'calypso/my-sites/plugins/plugin-spotlight';

function render() {
	return (
		<div>
			<PluginSpotlight eligiblePlugins={ eligiblePlugins } currentSites={ currentSites } />
		</div>
	);
}
```

## Props

- `eligiblePlugins`: a list with the plugins that are eligible to be featured on the spolight and its marketing copy.
- `currentSites`: a list of sites that are currenly selected.
