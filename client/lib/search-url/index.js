/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import buildUrl from 'lib/build-url';

const debug = debugFactory( 'calypso:search-url' );

export default function searchUrl( keywords, initialSearch, onSearch ) {
	if ( onSearch ) {
		onSearch( keywords );
		return;
	}

	const searchURL = buildUrl( window.location.href, keywords );

	debug( 'search posts for:', keywords );
	if ( initialSearch && keywords ) {
		debug( 'replacing URL: ' + searchURL );
		page.replace( searchURL );
	} else {
		debug( 'setting URL: ' + searchURL );
		page.show( searchURL );
	}
}
