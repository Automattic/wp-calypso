Plugin Toggle
=============

This component is used to display plugin settings toggles in the single plugin view.

#### How to use:

```js
var PluginToggle = require( 'my-sites/plugins/plugin-toggle/plugin-toggle' );

render: function() {
    return (
        <div className="your-plugin-toggle">
            <PluginToggle
                siteID={ this.props.site.ID }
                label={ this.translate( 'Autoupdates' ) }
                toggling={ this.props.plugin.disablingAutoupdates || this.props.plugin.enablingAutoupdates }
                action='autoupdate'
                checked={ this.getAutoupdates( this.props.plugin ) }
                toggle={ this.toggleAutoupdates }
                status={ this.state.autoupdatingStatus }
                visible={ this.props.plugin.autoupdate !== undefined }
            />
        </div>
    );
}
```

#### Props

* `siteID`: the ID of the site that is being action is beeing toggled for.
* `label` : The user friendly label that described the action.
* `toggling`: (bool) whether the action is in the middle of being toggled.
* `action`: the name of the action that descibles the toggle non translated.
* `checked`: (bool) the current status of the toggle.
* `toggle`: (callback) what should be executed once the user clicks the toggle
* `status`: The state of the progress indicator.
* `disabled`: (bool) whether the toggle should be in the disabled state
