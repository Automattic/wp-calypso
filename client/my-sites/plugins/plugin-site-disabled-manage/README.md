Plugin Site Disabled Manage
===========================

This component is used to display a warning when a site has not enabled jetpack manage

#### How to use:

```js
var PluginSiteDisabledManage = require( 'my-sites/plugins/plugin-site-disabled-manage' );

render: function() {
    return ( <PluginSiteDisabledManage
                site={ this.props.site }
                plugin={ this.props.plugin }
            />
    );
}
```

#### Props

* `plugin`: a plugin object.
* `site`: a site object.
* `isNetwork`: (optional) Whether the site is a network or not
