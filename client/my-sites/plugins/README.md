# Plugins

These components handle the `\plugins` section of Calypso. The plugins section supports a variety of routes:

```
/plugins
/plugins/:site_id
/plugins/:plugin_id/:site_id
```

The view module for the Plugins list in `Plugins` as a React component. It includes a single `Plugin` child component and a per site `PluginSite` component as well.

The `Plugins` component renders the list of plugins (all the plugins installed on the selected sites).

The `Plugin` component renders the site description and a list of `PluginSite` components sites, one `PluginSite` per site where the plugin is installed, with actions to update and activate/deactivate the plugin on that particular site.

## Plugins Controller

Right now, `controller.js` works as the controller for all the plugin-related view. In the future, it would be nice to have it a hub to redirect to single more-specific controllers associated to single views.
