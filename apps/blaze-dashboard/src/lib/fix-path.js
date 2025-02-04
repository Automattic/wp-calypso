import config from '@automattic/calypso-config';

// Page library adds the query string at the end of the initial path on the hash.
// We don't want that, so we clean the query and show the correct path when the app starts
export default ( path = '' ) => {
	const index = path.indexOf( '?' );
	path = index >= 0 ? path.substring( 0, index ) : path;

	// Fix the blaze path prefix if its not correct
	if ( path && ! path.startsWith( config( 'advertising_dashboard_path_prefix' ) ) ) {
		const segments = path.split( '/' );
		if ( segments.length > 1 ) {
			path = path.replace( `/${ segments[ 1 ] }`, config( 'advertising_dashboard_path_prefix' ) );
		}
	}

	return path;
};
