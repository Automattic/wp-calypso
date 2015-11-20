Plugin Version
==============

Displays the plugin and wordpress version as well as any updates that need to happen to the plugin.

#### How to use:

```js
var PluginVersion = require( 'my-sites/plugins/plugin-version' );

render: function() {
	return (
		<div className="your-plugins-list">
			<PluginVersion 
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
* `notices`: notices.
