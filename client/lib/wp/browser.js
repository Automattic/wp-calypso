/**
 * External dependencies
 */
import { SyncHandler, syncOptOut } from './sync-handler';
import debugFactory from 'debug';
import wpcomProxyRequest from 'wpcom-proxy-request';
const debug = debugFactory( 'calypso:wp' );

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import wpcomSupport from 'lib/wp/support';
import { injectLocalization } from './localization';
import { httpEnvelopeNormalizer } from './handlers/http-envelope-normalizer';
import { xhrErrorNormalizer } from './handlers/xhr-error-normalizer';

const addSyncHandlerWrapper = config.isEnabled( 'sync-handler' );
let wpcom, requestHandler;

if ( config.isEnabled( 'oauth' ) ) {
	const oauthToken = require( 'lib/oauth-token' );

	requestHandler = xhrErrorNormalizer;

	if ( addSyncHandlerWrapper ) {
		requestHandler = new SyncHandler( requestHandler );
	}

	requestHandler = httpEnvelopeNormalizer( requestHandler );

	wpcom = wpcomUndocumented( oauthToken.getToken(), requestHandler );
} else {
	requestHandler = wpcomProxyRequest;

	if ( addSyncHandlerWrapper ) {
		requestHandler = new SyncHandler( wpcomProxyRequest );
	}

	requestHandler = httpEnvelopeNormalizer( requestHandler );

	wpcom = wpcomUndocumented( requestHandler );

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

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

// expose wpcom global var only in development
if ( 'development' === config( 'env' ) ) {
	const wpcomPKG = require( 'wpcom/package' );
	window.wpcom = wpcom;
	window.wpcom.__version = wpcomPKG.version;
}

/**
 * Expose `wpcom`
 */
module.exports = wpcom;
