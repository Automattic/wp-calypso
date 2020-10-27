/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url';

function stripAutoPlays( searchParams ) {
	const returnVal = new URLSearchParams( searchParams );

	const keys = Array.from( searchParams.keys() ).filter( ( k ) => /^auto_?play$/i.test( k ) ) || [];

	keys.forEach( ( key ) => {
		// In the rare case that we're handed an array of values, we use the first one
		const val = searchParams.get( key ).toLowerCase();
		if ( val === '1' ) {
			returnVal.set( key, '0' );
		} else if ( val === 'true' ) {
			returnVal.set( key, 'false' );
		} else {
			// force a singular value
			returnVal.set( key, val );
		}
	} );
	return returnVal;
}

export function disableAutoPlayOnMedia( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}
	dom.querySelectorAll( 'audio, video' ).forEach( ( el ) => ( el.autoplay = false ) );
	return post;
}

export function disableAutoPlayOnEmbeds( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	dom.querySelectorAll( 'iframe' ).forEach( ( embed ) => {
		const urlParts = getUrlParts( embed.src );
		if ( urlParts.search ) {
			urlParts.searchParams = stripAutoPlays( urlParts.searchParams );
			delete urlParts.search;
			embed.src = getUrlFromParts( urlParts ).href;
		}
	} );

	return post;
}
