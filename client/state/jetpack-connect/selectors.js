/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteByUrl } from 'state/sites/selectors';

const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // an hour

const getConnectingSite = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};

const getAuthorizationData = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};

const getAuthorizationRemoteQueryData = ( state ) => {
	return get( getAuthorizationData( state ), [ 'queryObject' ] );
};

const getAuthorizationRemoteUrl = ( state ) => {
	return get( getAuthorizationRemoteQueryData( state ), [ 'site' ] );
};

const getSessions = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSessions' ] );
};

const getSSOSessions = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackSSOSessions' ] );
};

const getSSO = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackSSO' ] );
};

const isCalypsoStartedConnection = function( state, siteSlug ) {
	if ( ! siteSlug ) {
		return false;
	}
	const site = siteSlug.replace( /.*?:\/\//g, '' );
	const sessions = getSessions( state );

	if ( sessions[ site ] ) {
		const currentTime = ( new Date() ).getTime();
		return ( currentTime - sessions[ site ].timestamp < JETPACK_CONNECT_TTL );
	}

	return false;
};

const getFlowType = function( state, siteSlug ) {
	const sessions = getSessions( state );
	if ( siteSlug && sessions[ siteSlug ] ) {
		return sessions[ siteSlug ].flowType;
	}
	return false;
};

const getJetpackSiteByUrl = ( state, url ) => {
	const site = getSiteByUrl( state, url );
	if ( site && ! site.jetpack ) {
		return null;
	}
	return site;
};

/**
 * XMLRPC errors can be identified by the presence of an error message, the presence of an authorization code
 * and if the error message contains the string 'error'
 *
 * @param {object} state Global state tree
 * @returns {Boolean} If there's an xmlrpc error or not
 */
const hasXmlrpcError = function( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		authorizeData &&
		authorizeData.authorizeError &&
		authorizeData.authorizeError.message &&
		authorizeData.authorizationCode &&
		authorizeData.authorizeError.message.indexOf( 'error' ) > -1
	);
};

export default {
	getConnectingSite,
	getAuthorizationData,
	getAuthorizationRemoteQueryData,
	getAuthorizationRemoteUrl,
	getSessions,
	getSSOSessions,
	getSSO,
	isCalypsoStartedConnection,
	getFlowType,
	getJetpackSiteByUrl,
	hasXmlrpcError
};
