Plugin Settings Link
=====================

This component is used to display a link that take the user to the plugins settings section, where they can set up the plugin.

#### How to use:

```js
var PluginSettingsLink = require( 'my-sites/plugins/plugin-settings-link' );

render: function() {
    return <PluginSettingsLink linkUrl={ plugin.wp_admin_settings_page_url }  />;
}
```

#### Props

* `linkUrl`: URL string to the site's plugin setting screen.
