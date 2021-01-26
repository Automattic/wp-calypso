/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { head, includes, isEmpty, split } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import config, { isCalypsoLive } from '@automattic/calypso-config';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { addQueryArgs, externalRedirect, untrailingslashit } from 'calypso/lib/route';
import { urlToSlug } from 'calypso/lib/url';
import {
	JPC_PATH_PLANS,
	JPC_PATH_REMOTE_INSTALL,
	REMOTE_PATH_AUTH,
	JPC_PATH_CHECKOUT,
} from './constants';
import { authorizeQueryDataSchema } from './schema';

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
		woodna_service_name: queryObject.woodna_service_name || null,
		woodna_help_url: queryObject.woodna_help_url || null,
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

/**
 * Manage Jetpack Connect redirect after various site states
 *
 * @param  {string}     type Redirect type
 * @param  {string}     url Site url
 * @param  {?string}    product Product slug
 * @param  {?object}    queryArgs Query parameters
 * @returns {string}        Redirect url
 */
export function redirect( type, url, product = null, queryArgs = {} ) {
	let urlRedirect = '';
	const instr = '/jetpack/connect/instructions';

	if ( type === 'plans_selection' ) {
		urlRedirect = JPC_PATH_PLANS + '/' + urlToSlug( url );
		page.redirect( urlRedirect );
	}

	if ( type === 'remote_install' ) {
		urlRedirect = JPC_PATH_REMOTE_INSTALL;
		page.redirect( urlRedirect );
	}

	if ( type === 'remote_auth' ) {
		urlRedirect = addCalypsoEnvQueryArg( url + REMOTE_PATH_AUTH );
		externalRedirect( urlRedirect );
	}

	if ( type === 'install_instructions' ) {
		urlRedirect = addQueryArgs( { url }, instr );
		page.redirect( urlRedirect );
	}

	if ( type === 'checkout' ) {
		urlRedirect = `${ JPC_PATH_CHECKOUT }/${ urlToSlug( url ) }/${ product }`;
		page.redirect( addQueryArgs( queryArgs, urlRedirect ) );
	}

	return urlRedirect;
}
