/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */

export default function makeEmbedsSecure( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	let iframes = dom.querySelectorAll( 'iframe' );

	const badFrames = [];

	forEach( iframes, function( iframe ) {
		iframe.setAttribute( 'sandbox', '' );
		if ( ! startsWith( iframe.src, 'http' ) ) {
			badFrames.push( iframe );
		} else {
			iframe.src = iframe.src.replace( /^http:/, 'https:' );
		}
	} );

	forEach( badFrames, function( frame ) {
		frame.parentNode.removeChild( frame );
	} );

	if ( post.is_external || post.is_jetpack ) {
		let embeds = dom.querySelectorAll( 'embed,object' );

		forEach( embeds, function( embed ) {
			embed.parentNode.removeChild( embed );
		} );
	}

	return post;
}
