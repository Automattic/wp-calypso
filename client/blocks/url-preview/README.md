# urlPreview

A Higher Order Component for an instance of `WebPreview` that can show a preview with a particular URL.

```javascript
const UrlPreview = urlPreview( WebPreview );
<UrlPreview showPreview={ true } />
```

You shouldn't need to use this manually, as it is included in the always-available `SitePreview`, which can be activated using a Redux action like this:

```javascript
setPreviewType( 'site-preview' );
setLayoutFocus( 'preview' );
```

You can change the URL which is loaded in the preview frame by using the Redux action `setPreviewUrl()`. Otherwise, the front page of the current site is shown.
