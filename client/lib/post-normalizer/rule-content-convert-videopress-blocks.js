import readerContentWidth from 'calypso/reader/lib/content-width';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

export default function convertVideoPressBlocks( post, dom ) {
	const videoPresses = dom.querySelectorAll(
		'.wp-block-video.wp-block-embed.is-type-video.is-provider-videopress'
	);
	const contentWidth = readerContentWidth();
	const videoAspectRatio = 0.5625; // 16:9 aspect ratio

	//Loop through each VideoPress block and replace it with an iframe
	Array.from( videoPresses ).forEach( ( videoPress ) => {
		// An HTML iframe inside SVG or MathML would be parsed as a different element on render.
		if ( videoPress.namespaceURI !== HTML_NS ) {
			return;
		}

		const src = videoPress.querySelector( '.wp-block-embed__wrapper' )?.textContent?.trim();
		// Check URL to video is valid before creating iframe
		if ( ! src || ! src.startsWith( 'https://videopress.com/v/' ) ) {
			return;
		}
		const iframe = document.createElement( 'iframe' );
		iframe.src = src;
		iframe.width = contentWidth;
		iframe.height = contentWidth * videoAspectRatio;
		iframe.frameborder = '0';
		iframe.allowfullscreen = true;
		videoPress.parentNode.replaceChild( iframe, videoPress );
	} );
	return post;
}
