# DSS Actions and Stores

Dynamic Screenshots ("DSS") are a mechanism to generate theme preview thumbnails
for the theme picker (currently just the theme picker in the Signup flow) which
allow changing the images displayed in each thumbnail.

The images used to populate the previews come from Flickr, currently.

# How it works

There are two parts to DSS: the markup, and the images. Each theme preview is
actually a fully rendered version of the theme as html and CSS returned by the
`/dss` API endpoint. The `DSSActions.fetchThemePreview` action fetches that
markup. `fetchThemePreview` requires a theme slug. The results are stored in the
`ThemePreviewStore`.

The images are retrieved by calling the `DSSActions.fetchDSSImageFor` action and
passing a search string. The resulting images (and any necessary attribution
information) are returned and stored in the `DSSImageStore`.

The `Screenshot` component of DSS then modifies the markup to inject the best
image result, and renders that markup onto the page.
