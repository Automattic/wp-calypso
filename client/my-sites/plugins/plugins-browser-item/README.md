# Plugins Browser Item

This component is used to display small infobox with the data of a plugin.

## How to use

```js
import PluginListItem from 'calypso/my-sites/plugins-browser-item';

function render() {
	return (
		<div>
			<PluginListItem key={ slug } plugin={ plugin } isPlaceholder site={ site } />
		</div>
	);
}
```

## Props

- `plugin`: a plugin object. It defaults to a empty plugin used as placeholder
- `site`: a string containing the slug of the selected site

## Other

- `key`: Unique plugin key, this help react render a list better.
- `isPlaceholder`: Boolean, it marks if the item is a placeholder
- `iconSize`: number with the size of the icon. Defaulted to 40, since all the intertal css are adjusted around that value, it would be better to not change the default
