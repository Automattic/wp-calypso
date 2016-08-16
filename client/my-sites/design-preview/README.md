# designPreview

A Higher Order Component for an instance of `WebPreview` that can be customized.

```javascript
const DesignPreview = designPreview( WebPreview );
<DesignPreview showPreview={ true } />
```

The `DesignPreview` component can render raw markup to a preview and then apply customizations to that preview. The raw markup is fetched from the REST API and saved as `previewMarkup` in the Redux state tree (one for each site). When it is rendered, the method `updatePreviewWithChanges()` in `lib/design-preview` will be called with the arguments:

1. The document object of the iframe.
2. The current value of the `customizations` object from the Redux state tree for this site.

The `customizations` object and the `previewMarkup` used by the preview are stored in the Redux state tree under the `preview` key for a given site. The state also keeps track of the "saved" status of the customizations and a history of all customization changes (enabling an "undo" feature).

# Global Preview

The designPreview-wrapped WebPreview is intended to be a singleton; only one should ever be rendered.

Activating the global preview is done using the Redux action `setLayoutFocus( 'preview' )`.

You can change the URL which is loaded in the preview frame by using the Redux action `setPreviewUrl()`. Otherwise, the front page of the current site is shown.
