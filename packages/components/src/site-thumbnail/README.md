# SiteThumbnail

Renders a SiteThumbnail component.

## How to use

```jsx
import { SiteThumbnail } from '@automattic/components';

function render() {
	return <SiteThumbnail alt="site thumbnail" />;
}
```

## Props

- `alt`: a required string
- `backgroundColor`: an optional string
- `mShotsUrl`: an optional string to create the mShot
- `style`: an optional CSSObject to override the image style
- `width`: an optional number used for mShot and image style
- `height`: an optional number used for mShot and image style
- `dimensionsSrcset`: an optional Array of {width, height} to append to `srcSet`
- `sizesAttr`: an optional string for image size attribute for resopnsive
- `children`: an optional node to render inside if mshot fails or is empty
- `bgColorImgUrl`: an optional string for creating a blur background
- `viewport`: an optional number for mShot window size
- `mshotsOption`: an optional object passed to mShots
