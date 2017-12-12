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
	authBlogname: 'Example Blog',
	authClientId: CLIENT_ID,
	authFrom: 'banner-44-slide-1-dashboard',
	authHomeUrl: `http://${ SITE_SLUG }`,
	authJpVersion: '5.4',
	authNonce: 'fooBarNonce',
	authorizeError: false,
	authorizeSuccess: false,
	authRedirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
	// eslint-disable-next-line max-len
	authRedirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
	authScope: 'administrator:fooBarBaz',
	authSecret: 'fooBarSecret',
	authSite: `http://${ SITE_SLUG }`,
	authSiteIcon: '',
	authSiteUrl: `http://${ SITE_SLUG }`,
	authState: '2',
	authTracksUi: 'jetpack:fooBarBaz',
	authTracksUt: 'anon',
	authUserEmail: `email@${ SITE_SLUG }`,
	clientNotResponding: true,
	isAuthorizing: false,
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const JETPACK_CONNECT_AUTHORIZE_LOGGED_IN = deepFreeze( {
	authBlogname: 'Example Blog',
	authClientId: CLIENT_ID,
	authFrom: 'banner-44-slide-1-dashboard',
	authHomeUrl: `http://${ SITE_SLUG }`,
	authJpVersion: '5.4',
	authNewUserStartedConnection: '2',
	authNonce: 'fooBarNonce',
	authorizeError: false,
	authorizeSuccess: false,
	authRedirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
	// eslint-disable-next-line max-len
	authRedirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
	authScope: 'administrator:fooBarBaz',
	authSecret: 'fooBarSecret',
	authSite: `http://${ SITE_SLUG }`,
	authSiteIcon: '',
	authSiteUrl: `http://${ SITE_SLUG }`,
	authTracksUi: '' + USER_ID,
	authTracksUt: 'wpcom:user_id',
	authUserEmail: `email@${ SITE_SLUG }`,
	clientNotResponding: true,
	isAuthorizing: false,
	timestamp: 1509368045859,
	userAlreadyConnected: false,
} );

export const LOGGED_OUT_PROPS = deepFreeze( {
	authorizationRemoteQueryData: JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT.queryObject,
	isLoggedIn: false,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	setTracksAnonymousUserId: noop,
} );

export const LOGGED_IN_PROPS = deepFreeze( {
	authorizationRemoteQueryData: JETPACK_CONNECT_AUTHORIZE_LOGGED_IN.queryObject,
	isLoggedIn: true,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	setTracksAnonymousUserId: noop,
} );
