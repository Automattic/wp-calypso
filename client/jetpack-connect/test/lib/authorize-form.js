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
	authQuery: {
		blogname: 'Example Blog',
		clientId: CLIENT_ID,
		from: 'banner-44-slide-1-dashboard',
		homeUrl: `http://${ SITE_SLUG }`,
		jpVersion: '5.4',
		nonce: 'fooBarNonce',
		redirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
		// eslint-disable-next-line max-len
		redirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
		scope: 'administrator:fooBarBaz',
		secret: 'fooBarSecret',
		site: `http://${ SITE_SLUG }`,
		siteIcon: '',
		siteUrl: `http://${ SITE_SLUG }`,
		state: '2',
		tracksUi: 'jetpack:fooBarBaz',
		tracksUt: 'anon',
		userEmail: `email@${ SITE_SLUG }`,
	},
	clientNotResponding: true,
	isAuthorizing: false,
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const JETPACK_CONNECT_AUTHORIZE_LOGGED_IN = deepFreeze( {
	authorizeError: false,
	authorizeSuccess: false,
	clientNotResponding: true,
	isAuthorizing: false,
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const JETPACK_CONNECT_AUTH_QUERY_LOGGED_IN = deepFreeze( {
	blogname: 'Example Blog',
	clientId: CLIENT_ID,
	from: 'banner-44-slide-1-dashboard',
	homeUrl: `http://${ SITE_SLUG }`,
	jpVersion: '5.4',
	newUserStartedConnection: '2',
	nonce: 'fooBarNonce',
	redirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
	// eslint-disable-next-line max-len
	redirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
	scope: 'administrator:fooBarBaz',
	secret: 'fooBarSecret',
	site: `http://${ SITE_SLUG }`,
	siteIcon: '',
	siteUrl: `http://${ SITE_SLUG }`,
	tracksUi: '' + USER_ID,
	tracksUt: 'wpcom:user_id',
	userEmail: `email@${ SITE_SLUG }`,
} );

export const JETPACK_CONNECT_AUTH_QUERY_LOGGED_OUT = deepFreeze( {
	blogname: 'Example Blog',
	clientId: CLIENT_ID,
	from: 'banner-44-slide-1-dashboard',
	homeUrl: `http://${ SITE_SLUG }`,
	jpVersion: '5.4',
	newUserStartedConnection: '2',
	nonce: 'fooBarNonce',
	redirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
	// eslint-disable-next-line max-len
	redirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
	scope: 'administrator:fooBarBaz',
	secret: 'fooBarSecret',
	site: `http://${ SITE_SLUG }`,
	siteIcon: '',
	siteUrl: `http://${ SITE_SLUG }`,
	tracksUi: '' + USER_ID,
	tracksUt: 'wpcom:user_id',
	userEmail: `email@${ SITE_SLUG }`,
} );

export const LOGGED_OUT_PROPS = deepFreeze( {
	authQuery: JETPACK_CONNECT_AUTH_QUERY_LOGGED_OUT,
	isLoggedIn: false,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	setTracksAnonymousUserId: noop,
} );

export const LOGGED_IN_PROPS = deepFreeze( {
	authQuery: JETPACK_CONNECT_AUTH_QUERY_LOGGED_IN,
	isLoggedIn: true,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	setTracksAnonymousUserId: noop,
} );
