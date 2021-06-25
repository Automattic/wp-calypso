/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:search-url' );

export default function searchUrl( keywords, initialSearch, onSearch ) {
	if ( onSearch ) {
		onSearch( keywords );
		return;
	}

	const searchURL = buildRelativeSearchUrl( window.location.href, keywords );

	debug( 'search posts for:', keywords );
	if ( initialSearch && keywords ) {
		debug( 'replacing URL: ' + searchURL );
		page.replace( searchURL );
	} else {
		debug( 'setting URL: ' + searchURL );
		page.show( searchURL );
	}
}
