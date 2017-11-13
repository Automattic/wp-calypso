/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { noop } from 'lodash';

/**
 * Test fixtures
 */
export const CLIENT_ID = '98765';
export const SITE_ID = 1234567;
export const SITE_SLUG = 'an.example.site';
export const USER_ID = 1239876546;

export const JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT = deepFreeze( {
	authorizeError: false,
	authorizeSuccess: false,
	clientNotResponding: true,
	isAuthorizing: false,
	queryObject: {
		_ui: 'jetpack:fooBarBaz',
		_ut: 'anon',
		_wp_nonce: 'fooBarNonce',
		blogname: 'Example Blog',
		calypso_env: 'production',
		client_id: CLIENT_ID,
		from: 'banner-44-slide-1-dashboard',
		home_url: `http://${ SITE_SLUG }`,
		jp_version: '5.4',
		locale: 'en',
		redirect_after_auth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
		// eslint-disable-next-line max-len
		redirect_uri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
		scope: 'administrator:fooBarBaz',
		secret: 'fooBarSecret',
		site: `http://${ SITE_SLUG }`,
		site_icon: '',
		site_lang: 'en_US',
		site_url: `http://${ SITE_SLUG }`,
		state: '2',
		user_email: `email@${ SITE_SLUG }`,
		user_login: 'theUserLogin',
	},
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const JETPACK_CONNECT_AUTHORIZE_LOGGED_IN = deepFreeze( {
	authorizeError: false,
	authorizeSuccess: false,
	clientNotResponding: true,
	isAuthorizing: false,
	queryObject: {
		_ui: USER_ID,
		_ut: 'wpcom:user_id',
		_wp_nonce: 'fooBarNonce',
		blogname: 'Example Blog',
		calypso_env: 'production',
		client_id: CLIENT_ID,
		from: 'banner-44-slide-1-dashboard',
		home_url: `http://${ SITE_SLUG }`,
		jp_version: '5.4',
		locale: 'en',
		redirect_after_auth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
		// eslint-disable-next-line max-len
		redirect_uri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
		scope: 'administrator:fooBarBaz',
		secret: 'fooBarSecret',
		site: `http://${ SITE_SLUG }`,
		site_icon: '',
		site_lang: 'en_US',
		site_url: `http://${ SITE_SLUG }`,
		state: '2',
		user_email: `email@${ SITE_SLUG }`,
		user_login: 'theUserLogin',
	},
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const LOGGED_OUT_PROPS = deepFreeze( {
	authAttempts: 0,
	authorizationRemoteQueryData: JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT.queryObject,
	calypsoStartedConnection: false,
	isAlreadyOnSitesList: false,
	isFetchingAuthorizationSite: false,
	isFetchingSites: false,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	setTracksAnonymousUserId: noop,
	siteSlug: SITE_SLUG,
	user: null,
} );

export const LOGGED_IN_PROPS = deepFreeze( {
	authAttempts: 0,
	calypsoStartedConnection: false,
	isAlreadyOnSitesList: false,
	isFetchingAuthorizationSite: false,
	isFetchingSites: false,
	authorizationRemoteQueryData: JETPACK_CONNECT_AUTHORIZE_LOGGED_IN.queryObject,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	siteSlug: SITE_SLUG,
	user: {
		ID: USER_ID,
		display_name: "An Example User's Name",
		username: 'exampleusername',
	},
} );
