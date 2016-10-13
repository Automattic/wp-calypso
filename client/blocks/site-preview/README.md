# SitePreview

This PR replaces the top-level wrapper with a new component called `SitePreview`. `SitePreview` is a generic wrapper for components that display a preview (a `WebPreview` component) as an overlay. By design, only one `SitePreview` should be used: the one in the Layout. What it renders as its children is controlled by its props, and thus by the Redux store.

Activating the SitePreview is done using the Redux action `setLayoutFocus( 'preview' )`.

WebPreview's many props and support for children mean that it can be quite different depending on its context (eg: simple site previews, page and post previews, editor previews, and customizer previews all use different props and children).

Since there are many different ways that `WebPreview` can be used, this Higher Order Component acts as a sort of controller to decide how the preview behaves. The component choice is controlled via a prop called `currentPreviewType` which can be set via the Redux store (using the `setPreviewType()` action). That key is used to determine what is rendered by SitePreview.

Right now `currentPreviewType` defaults to 'site-preview' which renders the `urlPreview` component so that the existing behavior is unchanged, but it is easy to add different preview settings for different keys.

Different preview types might also require other data derived from the Redux store. For example, when the type is 'site-preview', you can change the URL which is loaded in the preview frame by using the action `setPreviewUrl()`.
