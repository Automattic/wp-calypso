# designPreview

A Higher Order Component for an instance of `WebPreview` that can be customized.

```javascript
const DesignPreview = designPreview( WebPreview );
<DesignPreview showPreview={ true } />
```

The `DesignPreview` component can render raw markup to a preview and then apply customizations to that preview. The raw markup is fetched from the REST API and saved as `previewMarkup` in the Redux state tree (one for each site). When it is rendered, it will render a group of pseudo-components each of which will update the preview with a set of customizations.

The `customizations` object and the `previewMarkup` used by the preview are stored in the Redux state tree under the `preview` key for a given site. The state also keeps track of the "saved" status of the customizations and a history of all customization changes (enabling an "undo" feature).

You shouldn't need to use this manually, as it is included in the always-available `SitePreview`, which can be activated using a Redux action like this:

```javascript
setPreviewType( 'design-preview' );
setLayoutFocus( 'preview' );
```
