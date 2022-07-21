# SiteThumbnail

Renders a SiteThumbnail component.

TODO:
- Set the text color based off whether the background color is dark or light. Look for `colord()` library: https://github.com/WordPress/gutenberg/pull/42232/files#diff-b53300a311404baec5a0c0cfc1d898fa89050f29959680b6317243be716c3691R166
- Add some nice loading effect when the mShots URL is loading (Display the fallback state while the screenshot is generated (letter+background color)).
- Fade in the mShots screenshot once it's loaded (instead of abruptly display it).
- Figure out how we'll pick a background color from a site. Might include creating an exported function for picking a color from a site icon, etc.
- Make sure we have examples of each permutation of the site thumbnail.
- Make our calls to `useMshotsImg()` more React-friendly.

## How to use

```jsx
import SiteThumbnail from '@automattic/components';

function render() {
	return <SiteThumbnail />;
}
```

## Props

TBD factors we need control over:
* Width and height of the component.

- `backgroundColor`: an optional string
- `mShotsUrl`: an optional string
- `size`: an optional string
