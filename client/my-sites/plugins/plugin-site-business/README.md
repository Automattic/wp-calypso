Plugin Site Buisness
====================

This component is used to display the buisness site's plugin actions.

#### How to use:

```js
var PluginSiteBusiness = require( 'my-sites/plugins/plugin-site-business' );

render: function() {
	return (
		<PluginSiteBusiness
			site={ this.props.site }
			notices={ this.props.notices }
		/>
	);
}
```

#### Props

* `site`: Site object containing with the plugin attribute.
* `notices` : Notices Object containing inProgress info of the toggle. 
