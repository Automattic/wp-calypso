/* eslint-disable wpcalypso/import-docblock */
import type { ConfigData } from '@automattic/create-calypso-config';

// TODO: Revisit whether it is useful for the Desktop app to override the following properties:
// signup_url, login_url, logout_url and discover_logged_out_redirect_url

const config = {
	env: 'production',
	env_id: 'desktop',
	client_slug: 'desktop',
	readerFollowingSource: 'desktop',
	boom_analytics_key: 'desktop',
	google_recaptcha_site_key: '6LdoXcAUAAAAAM61KvdgP8xwnC19YuzAiOWn5Wtn',
};

const features = {
	desktop: true,
	'desktop-promo': false,
	'sign-in-with-apple': false,
	'signup/social': false,
	'login/magic-login': false,
};

export default ( data: ConfigData ): ConfigData => {
	data = Object.assign( data, config );
	if ( data.features ) {
		data.features = Object.assign( data.features, features );
	}

	return data;
};
