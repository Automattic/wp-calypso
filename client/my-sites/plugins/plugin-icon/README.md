Plugin Icon
===========

This component is used to display the icon for a plugin. It takes a plugin image as a prop.

#### How to use:

```js
var PluginIcon = require( 'my-sites/plugins/plugin-icon/plugin-icon' );

render: function() {
    return (
        <div className="your-stuff">
              <PluginIcon image={ plugin.icon } />
        </div>
    );
}
```

#### Props

* `image`: an image source.
