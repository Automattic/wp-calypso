# Plugin Icon

This component is used to display the icon for a plugin. It takes a plugin image as a prop.

## How to use

```js
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';

function render() {
	return (
		<div className="your-stuff">
			<PluginIcon image={ plugin.icon } />
		</div>
	);
}
```

## Props

- `image` (`string`) - an image source.
- `isPlaceholder` (`bool`) - `true` to display as a placeholder.
- `className` (`string`) - A string that adds additional class names to this component.
