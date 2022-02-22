# Spotlight (TSX)

This component displays spotlight banner that contains an illustration, a tagline, a title and is able to link to a different page.

## How to use

```js
import Spotlight from 'calypso/components/spotlight';

const illustrationSrc = '/illustration.png';
const url = '/path/to/somewhere';
const taglineText = 'tagline text';
const titleText = 'title text';
const ctaText = 'cta text';


function render() {
	return (
		<Spotlight
			illustrationSrc={ illustrationSrc }
			url={ url }
			taglineText={ taglineText }
			titleText={ titleText }
			ctaText={ ctaText }
		/>
	);
}
```

## Props

- `illustrationSrc` (`string`) - The url of the illustration image.
- `url` (`string`) - The path of the page to navigate when clicking the spotlight banner.
- `taglineText` (`string`) - The text of the tagline.
- `titleText` (`string`) - The text of the title.
- `ctaText` (`string`) - The text of the cta button.
