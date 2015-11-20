Featured Plugins
================

This component takes a list of plugins and renders a gallery containing their banners.

#### How to use:

```js
var FeaturedPluginsComponent = require( 'my-sites/plugins/featured-plugins' );

render: function() {
	return (
		<div>

			<FeaturedPluginsComponent
				pluginsData={ pluginsData }
			/>

		</div>
	);
}
```

#### Props

* `pluginsData`: a PluginsData object
