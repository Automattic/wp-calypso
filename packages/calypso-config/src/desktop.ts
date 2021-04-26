/* eslint-disable wpcalypso/import-docblock */
import type { ConfigData } from '@automattic/create-calypso-config';

// TODO: Revisit whether it is useful for the Desktop app to override the following properties:
// signup_url, login_url, logout_url and discover_logged_out_redirect_url

const config = {
	env: 'production',
	env_id: 'desktop',
	client_slug: 'desktop',
	i18n_default_locale_slug: 'en',
	facebook_api_key: '249643311490',
	rebrand_cities_prefix: 'rebrandcitiessite',
	livechat_support_locales: [ 'en', 'es', 'pt-br' ],
	readerFollowingSource: 'desktop',
	siftscience_key: 'a4f69f6759',
	wpcom_signup_id: '39911',
	wpcom_signup_key: 'cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8',
	boom_analytics_key: 'desktop',
	google_analytics_key: 'UA-10673494-10',
	google_recaptcha_site_key: '6LdoXcAUAAAAAM61KvdgP8xwnC19YuzAiOWn5Wtn',
};

const features = {
	desktop: true,
	'desktop-promo': false,
	'sign-in-with-apple': 'false',
};

export default ( data: ConfigData ): ConfigData => {
	data = Object.assign( data, config );
	if ( data.features ) {
		data.features = Object.assign( data.features, features );
	}

	return data;
};
