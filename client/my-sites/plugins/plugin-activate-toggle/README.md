# Plugin Activate Toggle

This component is used to display a plugin activation toggle.

## How to use

```js
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';

function render() {
	return (
		<div className="your-plugins-list">
			<PluginActivateToggle plugin={ plugin } site={ site } notices={ notices } />
		</div>
	);
}
```

## Props

- `plugin`: a plugin object.
- `site`: a site object.
- `notices`: a notices object.
- `disabled`: a boolean indicating whether the toggle is disabled (grayed out and non interactive) or not
