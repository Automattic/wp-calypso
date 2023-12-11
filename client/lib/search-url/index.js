import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';

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
