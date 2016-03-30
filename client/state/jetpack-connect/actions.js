/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:jetpack-connect:actions' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { tracks } from 'analytics';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE
} from 'state/action-types';

/**
 *  Local variables;
 */
let _fetching = {};
const authURL = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true';
const installURL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';

export default {
	dismissUrl( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: url
			} );
		}
	},

	checkUrl( url ) {
		return ( dispatch ) => {
			if ( _fetching[ url ] ) {
				return;
			}
			_fetching[ url ] = true;
			setTimeout( () => {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL,
					url: url,
				} );
			}, 1 );
			Promise.all( [
				wpcom.undocumented().getSiteConnectInfo( url, 'exists' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isWordPress' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'hasJetpack' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isJetpackActive' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isJetpackConnected' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isWordPressDotCom' ),
			] ).then( ( data, error ) => {
				_fetching[ url ] = null;
				debug( 'jetpack-connect state checked for url', url, error, data );
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: data ? Object.assign.apply( Object, data ) : null,
					error: error
				} );
			} )
			.catch( ( error ) => {
				_fetching[ url ] = null;
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: null,
					error: error
				} );
			} );
		}
	},
	goToRemoteAuth( url ) {
		window.location = url + authURL;
	},
	goToPluginInstall( url ) {
		window.location = url + installURL;
	},
	createAccount( userData ) {
		return ( dispatch ) => {
			tracks.recordEvent( 'jetpack_connect_create_account' );
			dispatch( {
				type: JETPACK_CONNECT_CREATE_ACCOUNT,
				userData: userData
			} );
			wpcom.undocumented().usersNew(
				userData,
				( error, data ) => {
					if ( error ) {
						tracks.recordEvent( 'jetpack_connect_create_account_error', { error: error.code } );
					} else {
						tracks.recordEvent( 'jetpack_connect_create_account_success' );
					}
					dispatch( {
						type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
						userData: userData,
						data: data,
						error: error
					} );
				}
			);
		}
	},
	authorize( queryObject ) {
		return ( dispatch ) => {
			const { _wp_nonce, client_id, redirect_uri, scope, secret, state } = queryObject;
			debug( 'Authorizing', _wp_nonce, redirect_uri, scope, state );
			tracks.recordEvent( 'jetpack_connect_authorize' );
			dispatch( {
				type: JETPACK_CONNECT_AUTHORIZE,
				queryObject: queryObject
			} );
			wpcom.undocumented().jetpackLogin( client_id, _wp_nonce, redirect_uri, scope, state ).then( ( data ) => {
				return wpcom.undocumented().jetpackAuthorize( client_id, data.code, state, redirect_uri, secret );
			} ).then( ( data, error ) => {
				tracks.recordEvent( 'jetpack_connect_authorize_success' );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: data,
					error: error
				} );
			} )
			.catch( ( error ) => {
				debug( 'Authorize error', error );
				tracks.recordEvent( 'jetpack_connect_authorize_error', { error: error.code } );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: null,
					error: error
				} );
			} );
		}
	}
};
