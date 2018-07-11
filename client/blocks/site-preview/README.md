# SitePreview

`SitePreview` is a generic wrapper for components that display a preview (a `WebPreview` component) as an overlay. By design, only one `SitePreview` should be used: the one in the Layout. What it renders as its children is controlled by its props, and thus by the Redux store.

Activating the SitePreview is done using the Redux action `setLayoutFocus( 'preview' )`.

WebPreview's many props and support for children mean that it can be quite different depending on its context (eg: simple site previews, page and post previews, and editor previews all use different props and children).
