Plugin Install Button
=====================

This component is used to display a button that launch a install action when clicked.

#### How to use:

```js
var PluginInstallButton = require( 'my-sites/plugins/plugin-install-button' );

render: function() {
    return <PluginInstallButton
            plugin={ plugin }
            selectedSite={ site }
            isInstalling={ false }
            isEmbed={ false }
            notices={ notices }
        />;
}
```

#### Props

* `plugin`: a plugin object.
* `selectedSite`: a site object.
* `isInstalling`: an optional boolean indicating if there's a install action for this plugin and site already going on.
* `isEmbed`: an optional boolean indicating if the button is going to be rendered embed inside a plugin-site component.
* `notices` : (object) Object of errored, inProgress, and completed actions.
