/**
 * Module dependencies
 */
import wpcomFactory from '../index';
import qs from 'qs';
import oauthCors from 'wpcom-oauth-cors';
import fixture from './fixture';
var configFactory;

try {
	configFactory = require( './config' );
} catch ( ex ) {
	configFactory = {};
}

/**
 * Detect client/server side
 */
const isClientSide = 'undefined' !== typeof window;
let qryString;
let reqHandler;

const env =
	isClientSide &&
	( /^automattic\.github\.io/.test( document.location.host ) ||
		/wpcomjs\.com/.test( document.location.host ) )
		? 'production'
		: 'development';

console.log( 'environment: %j', env );

const config = configFactory[ env ] || {};

if ( isClientSide ) {
	const clientId = config.oauth.client_id;
	console.log( 'clientId: %o', clientId );

	qryString = qs.parse( document.location.search.replace( /^\?/, '' ) );
	reqHandler = qryString.handler || 'wpcom-proxy-request';
	console.log( `reqHandler: %o`, reqHandler );

	if ( 'wpcom-xhr-request' === reqHandler || /access_token/.test( document.location.hash ) ) {
		let wpoauth = oauthCors( clientId, config.oauth.options );

		wpoauth.get( function ( auth ) {
			console.log( 'auth: ', auth );
		} );
	}
}

module.exports = {
	wpcom: wpcom,
	wpcomPublic: function () {
		return wpcomFactory();
	},
	site: function () {
		// check for existence of config in this env, and site if available
		var site = config && config.site ? config.site : null;

		return site || fixture.site || process.env.SITE;
	},
	wordAds: function () {
		return config.wordads;
	},
};

function wpcom() {
	let _wpcom;
	if ( isClientSide ) {
		reqHandler = qryString.handler || 'wpcom-proxy-request';

		if ( 'wpcom-proxy-request' === reqHandler ) {
			console.log( 'PROXY request handler' );
			let proxy = require( 'wpcom-proxy-request' );
			_wpcom = wpcomFactory( proxy );
			_wpcom.request(
				{
					metaAPI: { accessAllUsersBlogs: true },
				},
				function ( err ) {
					if ( err ) throw err;
					console.log( 'proxy now running in "access all user\'s blogs" mode' );
				}
			);
		} else {
			console.log( 'XHR request handler' );
			let oauthToken = JSON.parse( localStorage.wp_oauth ).access_token;
			_wpcom = wpcomFactory( oauthToken );
		}
		// expose wpcom just for testing
		window.wpcom = _wpcom;
	} else {
		_wpcom = wpcomFactory( process.env.TOKEN || config.token );
	}
	return _wpcom;
}
