# DesignPreview

A wrapper for the always-available instance of `WebPreview` that's activated when `layoutFocus` is set to `preview`.

The `DesignPreview` component can render raw markup to a preview and then apply customizations to that preview. This PR adds a data layer for the preview markup and the customizations.

The raw markup is fetched from the REST API and saved as `previewMarkup` in the Redux state tree (one for each site). When it is rendered, the method `updatePreviewWithChanges()` in `lib/design-preview` will be called with the arguments:

1. The document object of the iframe.
2. The current value of the `customizations` object from the Redux state tree for this site.

The `customizations` object and the `previewMarkup` used by the preview are stored in the Redux state tree under the `preview` key for a given site. The state also keeps track of the "saved" status of the customizations and a history of all customization changes (enabling an "undo" feature).
