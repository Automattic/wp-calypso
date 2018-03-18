/** @format */
/**
 * External dependencies
 */
import config from 'config';
import PropTypes from 'prop-types';
import { addQueryArgs } from 'lib/route';
import { head, includes, isEmpty, split } from 'lodash';

export function authQueryTransformer( queryObject ) {
	return {
		// Required
		clientId: parseInt( queryObject.client_id, 10 ),
		homeUrl: queryObject.home_url,
		nonce: queryObject._wp_nonce,
		redirectUri: queryObject.redirect_uri,
		scope: queryObject.scope,
		secret: queryObject.secret,
		site: queryObject.site,
		state: queryObject.state,

		// Optional
		// TODO: verify
		authApproved: !! queryObject.auth_approved,

		// TODO: disabled to mitigate https://github.com/Automattic/jetpack/issues/8783
		// remove when fixed
		// alreadyAuthorized: !! queryObject.already_authorized,
		alreadyAuthorized: false,

		blogname: queryObject.blogname || null,
		from: queryObject.from || '[unknown]',
		jpVersion: queryObject.jp_version || null,
		partnerId: parseInt( queryObject.partner_id, 10 ) || null,
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
	partnerId: PropTypes.number,
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
	return addQueryArgs( { calypso_env: config( 'env_id' ) }, url );
}

/**
 * Convert an auth query scope to a role
 *
 * Auth queries include a scope like `role:hash`. This function will attempt to extract the role
 * when provided with a scope.
 *
 * @param  {string}  scope From authorization query
 * @return {?string}       Role parsed from scope if found
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
