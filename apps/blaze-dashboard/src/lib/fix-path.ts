// Page library adds the query string at the end of the initial path on the hash.
// We don't want that, so we clean the query and show the correct path when the app starts
export default ( path = '' ) => {
	const index = path.indexOf( '?' );
	return index >= 0 ? path.substring( 0, index ) : path;
};
