const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // an hour

const isCalypsoStartedConnection = function( state, siteSlug ) {
	if ( ! siteSlug ) {
		return false;
	}
	const site = siteSlug.replace( /.*?:\/\//g, '' );
	const sessions = state.jetpackConnect.jetpackConnectSessions;

	if ( sessions && sessions[ site ] ) {
		const currentTime = ( new Date() ).getTime();
		return ( currentTime - sessions[ site ].timestamp < JETPACK_CONNECT_TTL );
	}

	return false;
};

const getFlowType = function( state, site ) {
	const sessions = state.jetpackConnect.jetpackConnectSessions;
	if ( sessions && sessions[ site.slug ] ) {
		return sessions[ site.slug ].flowType;
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
	const authorizeData = state.jetpackConnect.jetpackConnectAuthorize;

	return (
		authorizeData &&
		authorizeData.authorizeError &&
		authorizeData.authorizeError.message &&
		authorizeData.authorizationCode &&
		authorizeData.authorizeError.message.indexOf( 'error' ) > -1
	);
};

export default { isCalypsoStartedConnection, getFlowType, hasXmlrpcError };
