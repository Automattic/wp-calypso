/** @format */

export function authQueryTransformer( queryObject ) {
	return {
		// Required
		authClientId: parseInt( queryObject.client_id, 10 ),
		authNonce: queryObject._wp_nonce,
		authRedirectUri: queryObject.redirect_uri,
		authScope: queryObject.scope,
		authSecret: queryObject.secret,
		authSite: queryObject.site,
		authState: queryObject.state,

		// Optional
		// TODO: verify
		authAlreadyAuthorized: !! queryObject.already_authorized,
		authBlogname: queryObject.blogname || null,
		authFrom: queryObject.from || null,
		authHomeUrl: queryObject.home_url || null,
		authJpVersion: queryObject.jp_version || null,
		authNewUserStartedConnection: !! queryObject.new_user_started_connection,
		authPartnerId: parseInt( queryObject.partner_id, 10 ) || null,
		authRedirectAfterAuth: queryObject.redirect_after_auth || null,
		authSiteIcon: queryObject.site_icon || null,
		authSiteUrl: queryObject.site_url || null,
		authTracksUi: queryObject._ui || null,
		authTracksUt: queryObject._ut || null,
		authUserEmail: queryObject.user_email || null,
	};
}
