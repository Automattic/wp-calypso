/**
 * External dependencies
 */
import { SyncHandler, syncOptOut } from './sync-handler';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wp' );
import qs from 'querystring';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import wpcomSupport from 'lib/wp/support';
import { injectLocalization } from './localization';

const GUEST_COOKIE_NAME = 'guest_sandbox_ticket';
let guestSandboxTicket = null;

/***
 * This function itializes guestSandboxTicket either from a url query string
 * or from a cookie that was set previously via the URL
 */
function initializeGuestSandboxTicket() {
	const queryObject = qs.decode( window.location.search.replace( '?', '' ) );

	if ( queryObject.guestTicket ) {
		guestSandboxTicket = queryObject.guestTicket;
		document.cookie = cookie.serialize( GUEST_COOKIE_NAME, guestSandboxTicket, { maxAge: 60 * 60 * 2 } );
	} else {
		const cookies = cookie.parse( document.cookie );
		if ( cookies[ GUEST_COOKIE_NAME ] ) {
			guestSandboxTicket = cookies[ GUEST_COOKIE_NAME ];
		}
	}
}
initializeGuestSandboxTicket();

const addSyncHandlerWrapper = config.isEnabled( 'sync-handler' );
let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	const oauthToken = require( 'lib/oauth-token' );
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'lib/wpcom-xhr-wrapper' ) )
		: require( 'lib/wpcom-xhr-wrapper' );

	wpcom = wpcomUndocumented( oauthToken.getToken(), requestHandler );
} else {
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'wpcom-proxy-request' ) )
		: require( 'wpcom-proxy-request' );

	wpcom = wpcomUndocumented( ( params, callback ) => {
		if ( guestSandboxTicket ) {
			const query = ( params.query || '' ).split( '&' );
			query.push( 'store_sandbox_ticket=' + encodeURIComponent( guestSandboxTicket ) );
			params.query = query.join( '&' );
		}

		return requestHandler( params, callback );
	} );

	// Upgrade to "access all users blogs" mode
	wpcom.request( {
		metaAPI: { accessAllUsersBlogs: true }
	}, function( error ) {
		if ( error ) {
			throw error;
		}
		debug( 'Proxy now running in "access all user\'s blogs" mode' );
	} );
}

if ( addSyncHandlerWrapper ) {
	wpcom = syncOptOut( wpcom );
}

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpcomSupport( wpcom );
}

// expose wpcom global var only in development
if ( 'development' === config( 'env' ) ) {
	const wpcomPKG = require( 'wpcom/package' );
	window.wpcom = wpcom;
	window.wpcom.__version = wpcomPKG.version;
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

/**
 * Expose `wpcom`
 */
module.exports = wpcom;
