Plugin Action
=========

This component is used to display a plugin action in the form of a toggle or a disconnect Jetpack button.

#### How to use:

By default, the PluginAction component will attempt to render a FormToggle.

```js
var PluginAction = require( 'my-sites/plugins/plugin-action/plugin-action' );

render: function() {
	return (
	  <div className="plugin-actions">
		<PluginAction
			label={ this.translate( 'Active', { context: 'plugin status' } ) }
			status={ this.isActive() }
			action={ this.toggleActivation }
			inProgress={ this.props.activateInProgress }
			htmlFor={ 'html-for-attribute-on-label' }
		/>
	  </div>
	);
}
```

This behavior can be overridden by passing a child to the PluginAction component.

```js
var PluginAction = require( 'my-sites/plugins/plugin-action/plugin-action' );

render: function() {
	return (
		<PluginAction label={ this.translate( 'Active and Connected', { context: 'plugin status' } ) }>
			<DisconnectJetpackButton disabled={ ! this.props.plugin } site={ this.props.site } redirect="/plugins/jetpack" />
		</PluginAction>
	);
}
```

#### Props

* `label` : The user friendly label that described the action.
* `status`: The state of the progress indicator.
* `action`: (callback) what should be executed once the user fires the action.
* `inProgress`: (bool) whether the action is in the middle of being performed.
* `htmlFor`: (string) htmlFor is used for creating the for attribute on the label.
* `disabledInfo`: ( string ) text that gets displayed in a infoPopover explaining why the action is disabled.

