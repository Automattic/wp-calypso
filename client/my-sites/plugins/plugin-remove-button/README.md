# Plugin Remove Button

This component is used to display a button that launch a remove action when clicked.

## How to use

```js
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';

function render() {
	return <PluginRemoveButton plugin={ plugin } site={ site } notices={ notices } />;
}
```

## Props

- `plugin`: a plugin object.
- `site`: a site object.
- `notices` : (object) Object of errored, inProgress, and completed actions.
