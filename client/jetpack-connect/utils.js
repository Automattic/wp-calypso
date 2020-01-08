/**
 * External dependencies
 */
import config, { isCalypsoLive } from 'config';
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import PropTypes from 'prop-types';
import { authorizeQueryDataSchema } from './schema';
import { head, includes, isEmpty, split } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs, untrailingslashit } from 'lib/route';

export function authQueryTransformer( queryObject ) {
	return {
		// Required
		clientId: parseInt( queryObject.client_id, 10 ),
		closeWindowAfterLogin: '1' === queryObject.close_window_after_login,
		homeUrl: queryObject.home_url,
		isPopup: '1' === queryObject.is_popup,
		nonce: queryObject._wp_nonce,
		redirectUri: queryObject.redirect_uri,
		scope: queryObject.scope,
		secret: queryObject.secret,
		site: queryObject.site,
		state: queryObject.state,

		// Optional
		// TODO: verify
		authApproved: !! queryObject.auth_approved,
		alreadyAuthorized: !! queryObject.already_authorized,
		blogname: queryObject.blogname || null,
		from: queryObject.from || '[unknown]',
		jpVersion: queryObject.jp_version || null,
		redirectAfterAuth: queryObject.redirect_after_auth || null,
		siteIcon: queryObject.site_icon || null,
		siteUrl: queryObject.site_url || null,
		userEmail: queryObject.user_email || null,
	};
}

export const authQueryPropTypes = PropTypes.shape( {
	authApproved: PropTypes.bool,
	alreadyAuthorized: PropTypes.bool,
	blogname: PropTypes.string,
	clientId: PropTypes.number.isRequired,
	from: PropTypes.string.isRequired,
	homeUrl: PropTypes.string.isRequired,
	jpVersion: PropTypes.string,
	nonce: PropTypes.string.isRequired,
	redirectAfterAuth: PropTypes.string,
	redirectUri: PropTypes.string.isRequired,
	scope: PropTypes.string.isRequired,
	secret: PropTypes.string.isRequired,
	site: PropTypes.string.isRequired,
	siteIcon: PropTypes.string,
	siteUrl: PropTypes.string,
	state: PropTypes.string.isRequired,
	userEmail: PropTypes.string,
} );

export function addCalypsoEnvQueryArg( url ) {
	let calypsoEnv = config( 'env_id' );
	if ( 'object' === typeof window && window.COMMIT_SHA && isCalypsoLive() ) {
		calypsoEnv = `live-${ COMMIT_SHA }`;
	}
	return addQueryArgs( { calypso_env: calypsoEnv }, url );
}

/**
 * Sanitize a user-supplied URL so we can use it for network requests.
 *
 * @param {string} inputUrl User-supplied URL
 * @returns {string} Sanitized URL
 */
export function cleanUrl( inputUrl ) {
	let url = inputUrl.trim().toLowerCase();
	if ( url && url.substr( 0, 4 ) !== 'http' ) {
		url = 'http://' + url;
	}
	url = url.replace( /wp-admin\/?$/, '' );
	return untrailingslashit( url );
}

/**
 * Convert an auth query scope to a role
 *
 * Auth queries include a scope like `role:hash`. This function will attempt to extract the role
 * when provided with a scope.
 *
 * @param  {string}  scope From authorization query
 * @returns {?string}       Role parsed from scope if found
 */
export function getRoleFromScope( scope ) {
	if ( ! includes( scope, ':' ) ) {
		return null;
	}
	const role = head( split( scope, ':', 1 ) );
	if ( ! isEmpty( role ) ) {
		return role;
	}
	return null;
}

/**
 * Parse an authorization query
 *
 * @property {Function} parser Lazy-instatiated parser
 * @param  {object}     query  Authorization query
 * @returns {?object}           Query after transformation. Null if invalid or errored during transform.
 */
export function parseAuthorizationQuery( query ) {
	if ( ! parseAuthorizationQuery.parser ) {
		parseAuthorizationQuery.parser = makeJsonSchemaParser(
			authorizeQueryDataSchema,
			authQueryTransformer
		);
	}
	try {
		return parseAuthorizationQuery.parser( query );
	} catch ( error ) {
		// The parser is expected to throw SchemaError or TransformerError on bad input.
	}
	return null;
}
