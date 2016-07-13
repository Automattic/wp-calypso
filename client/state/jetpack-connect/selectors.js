const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // an hour

const isCalypsoStartedConnection = function( state, siteSlug ) {
	if ( ! siteSlug ) {
		return false;
	}
	const site = siteSlug.replace( /.*?:\/\//g, '' );
	if ( state && state[ site ] ) {
		const currentTime = ( new Date() ).getTime();
		return ( currentTime - state[ site ].timestamp < JETPACK_CONNECT_TTL );
	}

	return false;
};

const getFlowType = function( state, site ) {
	const siteSlug = site.slug.replace( /.*?:\/\//g, '' );
	if ( state && state[ siteSlug ] ) {
		return state[ siteSlug ].flowType;
	}
	return false;
};

export default { isCalypsoStartedConnection, getFlowType };
