/**
 * Module dependencies
 */
var wpcomFactory = require( '../' );
var qs = require( 'qs' );
var oauthCors = require( 'wpcom-oauth-cors' );
var fixture = require( './fixture' );
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

const env = isClientSide && (
		/^automattic\.github\.io/.test( document.location.host ) ||
		/wpcomjs\.com/.test( document.location.host )
	)
		? 'production'
		: 'development';

const config = configFactory[ env ];

if ( isClientSide ) {
	const clientId = config.oauth.client_id;
	console.log( 'clientId: %o', clientId );

	qryString = qs.parse( document.location.search.replace( /^\?/, '' ) );
	reqHandler = qryString.handler || 'wpcom-proxy-request';
	console.log( `reqHandler -> %o`, reqHandler );

	if (
		'wpcom-xhr-request' === reqHandler ||
		/access_token/.test( document.location.hash )
	) {
		let wpoauth = oauthCors( clientId, config.oauth.options );

		wpoauth.get( function( auth ) {
			console.log( 'auth: ', auth );
		} );
	}
}

module.exports = {
	wpcom: wpcom,
	wpcomPublic: function() {
		return wpcomFactory();
	},
	site: function() {
		return fixture.site || process.env.SITE;
	}
};

function wpcom() {
	let _wpcom;
	if ( isClientSide ) {
		window.wpcom = _wpcom;

		reqHandler = qryString.handler || 'wpcom-proxy-request';

		if ( 'wpcom-proxy-request' === reqHandler ) {
			console.log( 'PROXY request handler' );
			let proxy = require( 'wpcom-proxy-request' );
			_wpcom = wpcomFactory( proxy );
			_wpcom.request( {
				metaAPI: { accessAllUsersBlogs: true }
			}, function( err ) {
				if ( err ) throw err;
				console.log( 'proxy now running in "access all user\'s blogs" mode' );
			} );
		} else {
			console.log( 'XHR request handler' );
			let oauthToken = JSON.parse( localStorage.wp_oauth ).access_token;
			_wpcom = wpcomFactory( oauthToken );
		}
	} else {
		_wpcom = wpcomFactory( process.env.TOKEN || config.token );
	}
	return _wpcom;
}
