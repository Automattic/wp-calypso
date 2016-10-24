/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';
import url from 'url';

/**
 * Internal Dependencies
 */

function stripAutoPlays( query ) {
	const keys = Object.keys( query ).filter( function( k ) {
		return /^auto_?play$/i.test( k );
	} );
	forEach( keys, key => {
		const val = query[ key ].toLowerCase();
		if ( val === '1' ) {
			query[ key ] = '0';
		} else if ( val === 'true' ) {
			query[ key ] = 'false';
		}
	} );
	return query;
}

export function disableAutoPlayOnMedia( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}
	forEach(
		dom.querySelectorAll( 'audio, video' ),
		el => el.autoplay = false
	);
	return post;
}

export function disableAutoPlayOnEmbeds( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	forEach( dom.querySelectorAll( 'iframe' ), embed => {
		const srcUrl = url.parse( embed.src, true, true );
		if ( srcUrl.query ) {
			srcUrl.query = stripAutoPlays( srcUrl.query );
			srcUrl.search = null;
			embed.src = url.format( srcUrl );
		}
	} );

	return post;
}
