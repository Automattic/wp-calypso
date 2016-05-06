const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // an hour

const isCalypsoStartedConnection = function( state, siteSlug ) {
	const site = siteSlug.replace( /.*?:\/\//g, '' );
	if ( state && state[ site ] ) {
		const currentTime = ( new Date() ).getTime();
		return ( currentTime - state[ site ] < JETPACK_CONNECT_TTL );
	}

	return false;
};

export default { isCalypsoStartedConnection };
