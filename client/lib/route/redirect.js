import page from 'page';
import config from 'config';

module.exports = function redirect( path ) {
	if ( config( 'env' ) === 'development' ) {
		throw 'route.redirect() is deprecated, use page.redirect()';
	}

	// Have to wrap the page.replace call in a defer due to
	// https://github.com/visionmedia/page.js/issues/50
	setTimeout( function() {
		page.replace( path );
	}, 0 );
};
