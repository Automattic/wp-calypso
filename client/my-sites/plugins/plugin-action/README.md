# Plugin Action

This component is used to display a plugin action in the form of a toggle or a disconnect Jetpack button.

## How to use

By default, the PluginAction component will attempt to render a FormToggle.

```js
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';

function render() {
	return (
		<div className="plugin-actions">
			<PluginAction
				label={ this.props.translate( 'Active', { context: 'plugin status' } ) }
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
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';
import { Button } from '@automattic/components';

function render() {
	return (
		<PluginAction
			label={ this.props.translate( 'Active and Connected', { context: 'plugin status' } ) }
		>
			<Button href="/plugins/jetpack" />
		</PluginAction>
	);
}
```

## Props

- `label` : The user friendly label that described the action.
- `status`: The state of the progress indicator.
- `action`: (callback) what should be executed once the user fires the action.
- `inProgress`: (bool) whether the action is in the middle of being performed.
- `htmlFor`: (string) htmlFor is used for creating the for attribute on the label.
- `disabledInfo`: ( string ) text that gets displayed in a infoPopover explaining why the action is disabled.
- `disabled`: ( bool ) whether the toggle is disabled (grayed out and non interactive) or not
