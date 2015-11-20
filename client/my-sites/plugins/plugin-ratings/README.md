Plugin Ratings
=============

This component is used to display the detail of how the ratings of a plugin are divided.

#### How to use:

```js
var PluginRatings = require( 'my-sites/plugins/plugin-ratings' );

render: function() {
	return <PluginRatings
			plugin={ this.props.plugin }
			barWidth={ 100 }
		/>;
}
```

#### Props

* `plugin`: A plugin object
* `barWidth`: Width in pixels for the percentage bars of the component
