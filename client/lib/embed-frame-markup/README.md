# Embed Frame Markup

Exports a single default function which, when invoked with an object containing one or more of `body`, `styles`, `scripts`, returns a generated page markup including those assets. Scripts and styles should be passed as objects reflecting the response structure from the [`GET /sites/%s/embeds/render`](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/embeds/render/) or [`GET /sites/%s/shortcodes/render`](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/shortcodes/render/) endpoints.

**WARNING:** You should be extremely careful when using this module, and it should only be used when you're certain that user input is properly sanitized and/or the generated output is used in a sandboxed context. If in doubt, you should probably avoid using this utility.

## Usage

```js
import generateEmbedFrameMarkup from 'calypso/lib/embed-frame-markup';

const markup = generateEmbedFrameMarkup( {
	body: 'Hello World',
	styles: {
		'jetpack-carousel': {
			src:
				'https://s1.wp.com/wp-content/mu-plugins/carousel/jetpack-carousel.css?m=1458924076h&ver=20120629',
			media: 'all',
		},
	},
	scripts: {
		'jetpack-facebook-embed': {
			src: 'https://s2.wp.com/wp-content/mu-plugins/shortcodes/js/facebook.js?ver',
			extra: 'var jpfbembed = {"appid":"249643311490"};',
		},
	},
} );

console.log( markup );
// -> '<html>…</html>'
```
