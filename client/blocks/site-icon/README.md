# Site Icon

This component is used to display the icon for a site. It takes a Site object as a prop. The size is set at 120px, used at 60px for retina display. Using one size allows us to only request one image and cache it on the browser. Even if you are displaying it at smaller sizes you should not change the requested image.

## How to use

```js
import SiteIcon from 'calypso/blocks/site-icon';

function render() {
	return <SiteIcon site={ site } />;
}
```

## Props

- `site`: a Site object. If no site prop is passed the component will render a fallback website icon.
- `size`: (default: 32) change the requested image size.
- `imgSize`: (default: 120) change the source image size. This should not be changed unless there's a valid requirement.
