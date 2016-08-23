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

/**
 * XMLRPC errors can be identified by the presence of an error message, the presence of an authorization code
 * and if the error message contains the string 'error'
 *
 * @param state
 * @returns {Boolean}
 */
const hasXmlrpcError = function( state ) {
	return (
		state.authorizeError &&
		state.authorizeError.message &&
		state.authorizationCode &&
		state.authorizeError.message.indexOf( 'error' ) > -1
	);
};

export default { isCalypsoStartedConnection, getFlowType, hasXmlrpcError };
