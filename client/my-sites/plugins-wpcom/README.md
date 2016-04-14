# Plugin Page Design

The plugins page provides an overview of the available built-in plugins on WordPress.com and a description of available plugin-like upgrades to help users understand the functionality available to them without installing plugins, and to offer the upgrades for premium functionality.

Because the list of plugins is relatively static, it's probably not worth loading data from an API to populate the list of plugins. Although this could be possible, for performance reasons it's best to declare the data at build-time and simply render it instantly. We can pull in additional status information from the API, but the defaults built into the code will be instantly available.

## Required state data

```js
data = {
  selectedPlugin: // pluginId
  standardPlugins: [
    {
      name: // String
      icon: // Gridicon slug
      descriptionLink: // URL
      category: // String classifying type of plugin functionality
      description: // React element or string description of plugin
    }
  ],
  premiumPlugins: [
    {
      name: // String
      plan: // String - indicates on which plan this plugin becomes available
      descriptionLink: // URL
      description: // React element or string description of plugin
      isActivated: // bool  
    }
  ],
  businessPLugins: [
    {
      name: // String
      plan: // String - indicates on which plan this plugin becomes available
      descriptionLink: // URL
      description: // React element or string description of plugin
      isActivated: // bool  
    }
  ]
}
```

## Panel Compilation

The panel displaying the plugins should be composed of a header area explaining the page, a grid of plugins active in general across WordPress.com, and a list of available premium and business plugin upgrades.
  
```jsx
<PluginPanel>
  <Header />

  <StandardPluginList>
    <StandardPlugin { ...props }>
      My description
    </StandardPlugin

    <StandardPlugin { ...props }>
      My other description
    </StandardPlugin
  </StandardPluginList>

  <PremiumPluginList>
    <PremiumPlugin { ...props }>
      No Ads! It's great.
    </PremiumPlugin>

    <PremiumPlugin { ...props }>
      Upload videos with ease!
    </PremiumPlugin>
  </PremiumPluginList>
</PluginPanel>
```
