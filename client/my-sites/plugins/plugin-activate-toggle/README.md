Plugin Activate Toggle
=========

This component is used to display a plugin activation toggle.

#### How to use:

```js
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';

render: function() {
	return (
		<div className="your-plugins-list">
			<PluginActivateToggle
				plugin={ plugin }
				site={ site }
				notices={ notices }
			/>
		</div>
	);
}
```

#### Props

* `plugin`: a plugin object.
* `site`: a site object.
* `notices`: a notices object.
* `isMock`: a boolean indicating if the toggle should not launch any real action when interacted
* `disabled`: a boolean indicating whether the toggle is disabled (grayed out and non interactive) or not