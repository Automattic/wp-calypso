Plugin Item
===========

This component is used to display a plugin card in a list of plugins.

#### How to use:

```js
var  = require( 'my-sites/plugins/plugin-item/plugin-item' );

render: function() {
    return (
        <div className="your-plugins-list">
            <PluginItem 
                plugin={ plugin }
                isSelected={ !! this.state.checkedPlugins[ plugin.slug ] }
                isSelectable={ this.state.bulkManagement }
                onClick={ this.pluginChecked.bind( this, plugin.slug ) }
                pluginLink={ this.props.path + '/' + encodeURIComponent( plugin.slug ) + this.siteSuffix() }
            />
        </div>
    );
}
```

#### Props

* `plugin`: a plugin object.
* `isSelected`: a boolean indicating if the plugin is selected.
* `isSelectable`: a boolean if the plugin is selectable. If true it will show a checkbox.
* `onClick`: onClick handler.
* `pluginLink`: the url of the plugin.
