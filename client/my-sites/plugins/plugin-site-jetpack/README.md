Plugin Site Jetpack
===================

This component is used to display a single instance of a plugin within a jetpack single site, including all the options & possible actions the user can do with it

#### How to use:

```js
var PluginSiteJetpack = require( 'my-sites/plugins/plugin-site/plugin-site-jetpack' );

render: function() {
    return (
        <PluginSiteJetpack
            site={ site }
            plugin={ plugin }
            notices={ notices }
            />
    );
}
```

#### Props

* `site`: a site object with the site which would be associated to the component.
* `plugin`: a plugin object.
* `notices`: a notices object.
