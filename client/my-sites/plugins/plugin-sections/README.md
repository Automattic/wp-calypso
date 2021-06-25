# Plugin Sections

This component is used to display the sections for a plugin as returned from the WP.org plugins API. If a plugin does not have any sections, this component will return `null`.

## How to use

```js
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';

function render() {
	return <PluginSections plugin={ plugin } />;
}
```

## Props

- `plugin` : (object) A plugin object.
