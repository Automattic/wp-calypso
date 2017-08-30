/**
 * External dependencies
 */
import buildUrl from 'lib/mixins/url-search/build-url';
import page from 'page';

const debug = require( 'debug' )( 'calypso:search-url' );

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
