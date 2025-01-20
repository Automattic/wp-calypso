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
	'login/last-used-method': false,
	'login/social-first': false,
	'sign-in-with-apple': false,
	// Note: there is also a sign-in-with-apple/redirect flag
	// that may/may not be relevant to override for the Desktop app.
	'signup/social': false,
	'signup/social-first': false,
	'login/magic-login': false,
	'bilmur-script': false,
};

export default ( data: ConfigData ): ConfigData => {
	data = Object.assign( data, config );
	if ( data.features ) {
		data.features = Object.assign( data.features, features );
	}
	if ( window.electron && window.electron.features ) {
		data.features = Object.assign( data.features ?? {}, window.electron.features );
	}

	return data;
};
