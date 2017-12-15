/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export function authQueryTransformer( queryObject ) {
	return {
		// Required
		clientId: parseInt( queryObject.client_id, 10 ),
		nonce: queryObject._wp_nonce,
		redirectUri: queryObject.redirect_uri,
		scope: queryObject.scope,
		secret: queryObject.secret,
		site: queryObject.site,
		state: queryObject.state,

		// Optional
		// TODO: verify
		alreadyAuthorized: !! queryObject.already_authorized,
		blogname: queryObject.blogname || null,
		from: queryObject.from || null,
		homeUrl: queryObject.home_url || null,
		jpVersion: queryObject.jp_version || null,
		newUserStartedConnection: !! queryObject.new_user_started_connection,
		partnerId: parseInt( queryObject.partner_id, 10 ) || null,
		redirectAfterAuth: queryObject.redirect_after_auth || null,
		siteIcon: queryObject.site_icon || null,
		siteUrl: queryObject.site_url || null,
		tracksUi: queryObject._ui || null,
		tracksUt: queryObject._ut || null,
		userEmail: queryObject.user_email || null,
	};
}

export const authQueryPropTypes = PropTypes.shape( {
	alreadyAuthorized: PropTypes.bool,
	blogname: PropTypes.string,
	clientId: PropTypes.number.isRequired,
	from: PropTypes.string,
	homeUrl: PropTypes.string,
	jpVersion: PropTypes.string,
	newUserStartedConnection: PropTypes.bool,
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
	tracksUi: PropTypes.string,
	tracksUt: PropTypes.string,
	userEmail: PropTypes.string,
} );
