# Plugin Autoupdate Toggle

This component is used to display a plugin autupdate toggle.

## How to use

```js
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';

function render() {
	return (
		<div className="your-plugins-list">
			<PluginAutoupdateToggle plugin={ plugin } site={ site } notices={ notices } wporg />
		</div>
	);
}
```

## Props

- `plugin`: a plugin object.
- `site`: a site object.
- `notices`: a notices object.
- `wporg`: whether the plugin is from .org or not
- `isMock`: a boolean indicating if the toggle should not launch any real action when interacted
- `disabled`: a boolean indicating whether the toggle is disabled (grayed out and non interactive) or not
