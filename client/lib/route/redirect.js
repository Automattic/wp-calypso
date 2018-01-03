/** @format */
/**
 * Internal dependencies
 */
import page from 'page';

export default function redirect( path ) {
	if ( process.env.NODE_ENV === 'development' ) {
		throw 'route.redirect() is deprecated, use page.redirect()';
	}

	// Have to wrap the page.replace call in a defer due to
	// https://github.com/visionmedia/page.js/issues/50
	setTimeout( function() {
		page.replace( path );
	}, 0 );
}
