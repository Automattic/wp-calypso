# Plugin Meta

This component is used to display the meta information of a single plugin. Includes the plugin banner, plugin icon, description, author and plugin link.

## How to use

```js
import PluginMeta from 'calypso/my-sites/plugins/plugin-meta';

function render() {
	return <PluginMeta plugin={ plugin } />;
}
```

## Props

- `plugin` : (object) A plugin object.
- `siteURL` : (string) The URL of the selected site. Used to determine if this is a single or all sites view.
- `sites` : (array) An array of the sites that current plugin is installed on.
- `isPlaceholder`: (boolean) Whether the component is being rendered in placeholder mode
- `isMock`: (boolean) indicating if the toggle should not launch any real action when interacted
- `isInstalledOnSite`: (boolean) indicating if the plugin is installed on the site or not.
- `allowedActions`: (object) Object of actions allowed on the plugin: `activation`, `autoupdate`, `remove`. Used to display/hide plugin actions.
