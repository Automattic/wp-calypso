import config from '@automattic/calypso-config';
import superagent from 'superagent';

// Generic error handling is good for now,
// we can handle more specific errors via the query param if needed in the future.
const ERROR_REDIRECT = '/sso-bridge?sso_error=failed';

async function ssoBridge( req, res, next ) {
	const dashboardSupportsOAuth = config( 'hostname_overrides' )?.[ req.hostname ]?.features?.oauth;

	// The SSO Bridge is gated to only OAuth-powered MSD instances, indicating they live outside the wpcom domain.
	if ( ! dashboardSupportsOAuth ) {
		next();
		return;
	}

	// Pass through to frontend if there is no OAuth token yet.
	const token = req.cookies?.wpcom_token;
	if ( ! token ) {
		next();
		return;
	}

	// Pass through to the frontend for error handling.
	if ( req.query.sso_error ) {
		next();
		return;
	}

	// The user made it to the remote WP site, but didn't have an account/connection.
	const brokerAuthRedirect = req.query[ 'broker-sso-auth-redirect' ];
	if ( brokerAuthRedirect === '1' ) {
		res.redirect( ERROR_REDIRECT );
		return;
	}

	const { site_id, sso_nonce } = req.query;
	if ( ! site_id || ! sso_nonce || ! /^\d+$/.test( site_id ) ) {
		res.redirect( ERROR_REDIRECT );
		return;
	}

	try {
		const apiUrl = `https://public-api.wordpress.com/rest/v1/jetpack-blogs/${ site_id }/sso-authorize`;
		const response = await superagent
			.post( apiUrl )
			.set( 'Authorization', `Bearer ${ token }` )
			.send( { sso_nonce } );

		const ssoUrl = response.body?.sso_url;
		if ( ! ssoUrl ) {
			res.redirect( ERROR_REDIRECT );
			return;
		}

		res.redirect( ssoUrl );
	} catch ( err ) {
		res.redirect( ERROR_REDIRECT );
	}
}

export default function ( app ) {
	app.get( '/sso-bridge', ssoBridge );
}

export { ssoBridge };
