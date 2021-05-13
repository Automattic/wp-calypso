# Plugin Site Update Indicator

This component is used to display a update indicator which can be turned into a update button

## How to use

```js
import PluginSiteUpdateIndicator from 'calypso/my-sites/plugins/plugin-site-update-indicator';

function render() {
	return (
		<PluginSiteUpdateIndicator
			site={ this.props.site }
			plugin={ this.props.plugin }
			notices={ this.props.notices }
			expanded={ false }
		/>
	);
}
```

## Props

- `site`: a site object with the site which would be associated to the component.
- `notices`: a notices object.
- `plugin`: a plugin object.
- `expanded`: (default: false) a boolean indicating if the component should expand into an updating button.
