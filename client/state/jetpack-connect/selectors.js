/** @format */

/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTH_ATTEMPS_TTL } from './constants';
import { getSiteByUrl } from 'state/sites/selectors';
import { isStale } from './utils';

export const getJetpackSiteByUrl = ( state, url ) => {
	const site = getSiteByUrl( state, url );
	if ( site && ! site.jetpack ) {
		return null;
	}
	return site;
};

export const getConnectingSite = state => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};

export const getAuthorizationData = state => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};

export const getAuthorizationRemoteQueryData = state => {
	return get( getAuthorizationData( state ), 'queryObject' );
};

export const getAuthorizationRemoteSite = state => {
	return get( getAuthorizationRemoteQueryData( state ), 'site' );
};

export const isRemoteSiteOnSitesList = state => {
	const remoteUrl = getAuthorizationRemoteSite( state ),
		authorizationData = getAuthorizationData( state );

	if ( ! remoteUrl ) {
		return false;
	}

	if ( authorizationData.clientNotResponding ) {
		return false;
	}

	return !! getJetpackSiteByUrl( state, remoteUrl );
};

export const getSSO = state => {
	return get( state, [ 'jetpackConnect', 'jetpackSSO' ] );
};

export const isRedirectingToWpAdmin = function( state ) {
	const authorizationData = getAuthorizationData( state );
	return !! authorizationData.isRedirectingToWpAdmin;
};

export const getAuthAttempts = ( state, slug ) => {
	const attemptsData = get( state, [ 'jetpackConnect', 'jetpackAuthAttempts', slug ] );
	if ( attemptsData && isStale( attemptsData.timestamp, AUTH_ATTEMPS_TTL ) ) {
		return 0;
	}
	return attemptsData ? attemptsData.attempt || 0 : 0;
};

/**
 * Returns true if the user is already connected, otherwise false
 *
 * @param  {Object}  state Global state tree
 * @return {boolean}       True if the user is connected otherwise false
 */
export const getUserAlreadyConnected = state => {
	return get( getAuthorizationData( state ), 'userAlreadyConnected', false );
};

/**
 * Returns true if there is an XMLRPC error.
 *
 * XMLRPC errors can be identified by the presence of an error message, the presence of an
 * authorization code, and if the error message contains the string 'error'.
 *
 * @param  {object}  state Global state tree
 * @return {Boolean}       True if there's an xmlrpc error otherwise false
 */
export const hasXmlrpcError = function( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		!! get( authorizeData, 'authorizationCode', false ) &&
		includes( get( authorizeData, [ 'authorizeError', 'message' ] ), 'error' )
	);
};

/**
 * Returns true if there is an expired secret error.
 *
 * @param  {object}  state Global state tree
 * @return {Boolean}       True if there's an xmlrpc error otherwise false
 */
export const hasExpiredSecretError = function( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		!! get( authorizeData, 'authorizationCode', false ) &&
		includes( get( authorizeData, [ 'authorizeError', 'message' ] ), 'verify_secrets_expired' )
	);
};

export const getSiteIdFromQueryObject = function( state ) {
	const queryObject = getAuthorizationRemoteQueryData( state );
	if ( queryObject && queryObject.client_id ) {
		return parseInt( queryObject.client_id, 10 );
	}
	return null;
};
