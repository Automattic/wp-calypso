/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteByUrl } from 'state/sites/selectors';
import { isStale } from './utils';
import { urlToSlug } from 'lib/url';
import { AUTH_ATTEMPS_TTL } from './constants';

const getJetpackSiteByUrl = ( state, url ) => {
	const site = getSiteByUrl( state, url );
	if ( site && ! site.jetpack ) {
		return null;
	}
	return site;
};

const getConnectingSite = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};

const getAuthorizationData = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};

const getAuthorizationRemoteQueryData = ( state ) => {
	return get( getAuthorizationData( state ), [ 'queryObject' ] );
};

const getAuthorizationRemoteSite = ( state ) => {
	return get( getAuthorizationRemoteQueryData( state ), [ 'site' ] );
};

const isRemoteSiteOnSitesList = ( state ) => {
	const remoteUrl = getAuthorizationRemoteSite( state );

	if ( ! remoteUrl ) {
		return false;
	}

	return !! getJetpackSiteByUrl( state, remoteUrl );
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
	const site = urlToSlug( siteSlug );
	const sessions = getSessions( state );

	if ( sessions[ site ] && sessions[ site ].timestamp ) {
		return ! isStale( sessions[ site ].timestamp );
	}

	return false;
};

const isRedirectingToWpAdmin = function( state ) {
	const authorizationData = getAuthorizationData( state );
	return !! authorizationData.isRedirectingToWpAdmin;
};

const getFlowType = function( state, siteSlug ) {
	const sessions = getSessions( state );
	siteSlug = urlToSlug( siteSlug );

	if ( siteSlug && sessions[ siteSlug ] ) {
		return sessions[ siteSlug ].flowType;
	}
	return false;
};

const getAuthAttempts = ( state, slug ) => {
	const attemptsData = get( state, [ 'jetpackConnect', 'jetpackAuthAttempts', slug ] );
	if ( attemptsData && isStale( attemptsData.timestamp, AUTH_ATTEMPS_TTL ) ) {
		return 0;
	}
	return attemptsData ? attemptsData.attempt || 0 : 0;
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

const hasExpiredSecretError = function( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		authorizeData &&
		authorizeData.authorizeError &&
		authorizeData.authorizeError.message &&
		authorizeData.authorizationCode &&
		authorizeData.authorizeError.message.indexOf( 'verify_secrets_expired' ) > -1
	);
};

const getJetpackPlanSelected = function( state ) {
	const selectedPlans = state.jetpackConnect.jetpackConnectSelectedPlans;
	const siteUrl = getAuthorizationRemoteQueryData( state ).site;

	if ( siteUrl ) {
		const siteSlug = urlToSlug( siteUrl );
		if ( selectedPlans && selectedPlans[ siteSlug ] ) {
			return selectedPlans[ siteSlug ];
		}
	}
	return false;
};

const getSiteSelectedPlan = function( state, siteSlug ) {
	return state.jetpackConnect.jetpackConnectSelectedPlans && state.jetpackConnect.jetpackConnectSelectedPlans[ siteSlug ];
};

const getGlobalSelectedPlan = function( state ) {
	return state.jetpackConnect.jetpackConnectSelectedPlans && state.jetpackConnect.jetpackConnectSelectedPlans[ '*' ];
};

export default {
	getConnectingSite,
	getAuthorizationData,
	getAuthorizationRemoteQueryData,
	getAuthorizationRemoteSite,
	getSessions,
	getSSOSessions,
	getSSO,
	isCalypsoStartedConnection,
	isRedirectingToWpAdmin,
	isRemoteSiteOnSitesList,
	getFlowType,
	getJetpackSiteByUrl,
	hasXmlrpcError,
	hasExpiredSecretError,
	getJetpackPlanSelected,
	getSiteSelectedPlan,
	getGlobalSelectedPlan,
	getAuthAttempts
};
