Plugin Activate Toggle
=========

This component is used to display a plugin activation toggle.

#### How to use:

```js
var PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' );

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
