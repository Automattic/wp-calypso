/**
 * External Dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
const debug = debugFactory( 'calypso:post-normalizer:detect-luminosity' );

/**
 * Adapted from: http://jsfiddle.net/s7Wx2/7/
 *
 * @param  {object}    post        A post to classify
 * @param  {function}  callback    Callback function
 * @return {object}                The classified post
 */
export default function isItDark( post, callback ) {
	if ( ! post || ! post.canonical_image ) {
		debug( 'no canonical_image for post %o', post );
		return callback();
	}

	const imageSrc = post.canonical_image.uri;
	debug( 'isItDark? %o', imageSrc );

	const fuzzy = 0.1;
	const img = document.createElement( 'img' );

	img.onload = function() {
		const canvas = document.createElement( 'canvas' );
		canvas.width = img.width;
		canvas.height = img.height;

		const ctx = canvas.getContext( '2d' );
		ctx.drawImage( img, 0, 0 );

		const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
		const data = imageData.data;
		let r, g, b, max_rgb;
		let light = 0;
		let dark = 0;

		for ( let x = 0, len = data.length; x < len; x += 4 ) {
			r = data[ x + 0 ];
			g = data[ x + 1 ];
			b = data[ x + 2 ];

			max_rgb = Math.max( Math.max( r, g ), b );
			if ( max_rgb < 128 ) {
				dark++;
			} else {
				light++;
			}
		}

		const diff = ( light - dark ) / ( img.width * img.height );
		if ( diff + fuzzy < 0 ) {
			post.is_dark = true;	/* Dark */
		} else {
			post.is_dark = false; /* Not dark */
		}

		callback();
	};

	img.style.display = 'none';
	img.crossOrigin = 'anonymous';
	img.src = imageSrc;
	document.body.appendChild( img );
}
