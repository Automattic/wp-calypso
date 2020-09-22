# Web Preview

This component facilitates the display of iframed content. See the `propTypes` for configurable options. Basic usage is:

```jsx
<WebPreview
	showPreview={ this.showPreview() }
	onClose={ this.hidePreview }
	previewUrl={ this.getUrlToIframe() }
/>;
```

---

## WithPreviewProps

This is a helper [function-as-children] component responsible for computing props to be used to create a _link_ to a given URL. The point, however, is that this will attempt to render that resource inside WebPreview if the right conditions (_cf._ below) are met. If they aren't met, the fallback is to treat the link as external and open it in a new window.

### Constraints

Calypso is meant to be run over HTTPS when in production. Since WebPreview uses iframes internally, this requires that any URL to be loaded in the iframe be also loaded **via HTTPS** in order to avoid Mixed Content browser errors. Furthermore, WebPreview is designed for **viewing internal resources** — _e.g.,_ the front end of a site — and not the broader Web.

### Usage

With those constraints in mind, usage is the following:

```jsx
<WithPreviewProps url={ myFrontEndPreview } isPreviewable={ isMySitePreviewable }>
	{ ( props ) => (
		<Button { ...props } icon={ isMySitePreviewable ? 'visible' : 'external' }>
			View Site
		</Button>
	) }
</WithPreviewProps>;
```

`isPreviewable` should be a boolean to determine whether the URL should be loaded in WebPreview or externally. Bear in mind that not all front-end links are previewable — Jetpack sites, for instance, may not be supported for a number of reasons, including absent HTTPS support. As of this writing, a suggestion is to rely on the `getSite` (state/sites/selectors) selector, which relies on `lib/site/computed-attributes` to return a `is_previewable` attribute:

```jsx
const site = getSite( state, siteId );
const isPreviewable = get( site, 'is_previewable' );

<WithPreviewProps url={ url } isPreviewable={ isPreviewable }>
	{ ( props ) => {
		/*...*/
	} }
</WithPreviewProps>;
```

[function-as-children]: https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9
