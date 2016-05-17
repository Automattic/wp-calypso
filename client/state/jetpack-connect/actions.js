/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:jetpack-connect:actions' );
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'state/analytics/actions';
import Dispatcher from 'dispatcher';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_ACTIVATE_MANAGE,
	JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
	JETPACK_CONNECT_REDIRECT,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_STORE_SESSION,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR
} from 'state/action-types';
import userFactory from 'lib/user';

/**
 *  Local variables;
 */
let _fetching = {};
const authURL = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true&calypso_env=' + process.env.NODE_ENV;
const installURL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';
const activateURL = '/wp-admin/plugins.php';
const userModule = userFactory();
const tracksEvent = ( dispatch, eventName, props ) => {
	setTimeout( () => {
		dispatch( recordTracksEvent( eventName, props ) );
	}, 1 );
};

export default {
	dismissUrl( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: url
			} );
		};
	},

	checkUrl( url, isUrlOnSites ) {
		return ( dispatch ) => {
			if ( _fetching[ url ] ) {
				return;
			}

			if ( isUrlOnSites ) {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL,
					url: url,
				} );
				setTimeout( () => {
					dispatch( {
						type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
						url: url,
						data: { exists: true, isWordPress: true, hasJetpack: true, isJetpackActive: true, isJetpackConnected: true, isWordPressDotCom: false, userOwnsSite: true },
						error: null
					} );
				} );
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
				data = data ? Object.assign.apply( Object, data ) : null;
				debug( 'jetpack-connect state checked for url', url, error, data );
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: data,
					error: error
				} );

				let errorCode = null;
				let instructionsType = null;
				if ( data && data.isWordPressDotCom ) {
					errorCode = 'calypso_jpc_error_wpdotcomsite';
				} else if ( data && ! data.exists ) {
					errorCode = 'calypso_jpc_error_notexists';
				} else if ( data && ! data.isWordPress ) {
					errorCode = 'calypso_jpc_error_notwpsite';
				} else if ( data && ! data.hasJetpack ) {
					errorCode = 'calypso_jpc_instructions_view';
					instructionsType = 'not_jetpack';
				} else if ( data && ! data.isJetpackActive ) {
					errorCode = 'calypso_jpc_instructions_view';
					instructionsType = 'inactive_jetpack';
				}

				if ( errorCode ) {
					tracksEvent( dispatch, errorCode, {
						url: url,
						type: instructionsType
					} );
				}

				if ( ! error ) {
					debug( 'jetpack-connect store correct session', url, error, data );
					dispatch( {
						type: JETPACK_CONNECT_STORE_SESSION,
						url: url
					} );
				} else {
					tracksEvent( dispatch, 'calypso_jpc_error_other', {
						url: url
					} );
				}
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
		};
	},
	goToRemoteAuth( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT,
				url: url
			} );
			tracksEvent( dispatch, 'calypso_jpc_success_redirect', {
				url: url,
				type: 'remote_auth'
			} );
			window.location = url + authURL;
		};
	},
	goToPluginInstall( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT,
				url: url
			} );
			tracksEvent( dispatch, 'calypso_jpc_success_redirect', {
				url: url,
				type: 'plugin_install'
			} );
			window.location = url + installURL;
		};
	},
	goToPluginActivation( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT,
				url: url
			} );
			tracksEvent( dispatch, 'calypso_jpc_success_redirect', {
				url: url,
				type: 'plugin_activation'
			} );
			window.location = url + activateURL;
		};
	},
	goBackToWpAdmin( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT_WP_ADMIN
			} );
			window.location = url;
		};
	},
	createAccount( userData ) {
		return ( dispatch ) => {
			tracksEvent( dispatch, 'calypso_jpc_create_account', {} );

			dispatch( {
				type: JETPACK_CONNECT_CREATE_ACCOUNT,
				userData: userData
			} );
			wpcom.undocumented().usersNew(
				userData,
				( error, data ) => {
					if ( error ) {
						tracksEvent( dispatch, 'calypso_jpc_create_account_error', { error: error.code } );
					} else {
						tracksEvent( dispatch, 'calypso_jpc_create_account_success', {} );
					}
					dispatch( {
						type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
						userData: userData,
						data: data,
						error: error
					} );
				}
			);
		};
	},
	authorize( queryObject ) {
		return ( dispatch ) => {
			const { _wp_nonce, client_id, redirect_uri, scope, secret, state } = queryObject;
			debug( 'Trying Jetpack login.', _wp_nonce, redirect_uri, scope, state );
			tracksEvent( dispatch, 'calypso_jpc_authorize' );
			dispatch( {
				type: JETPACK_CONNECT_AUTHORIZE,
				queryObject: queryObject
			} );
			wpcom.undocumented().jetpackLogin( client_id, _wp_nonce, redirect_uri, scope, state )
			.then( ( data ) => {
				debug( 'Jetpack login complete. Trying Jetpack authorize.', data );
				return wpcom.undocumented().jetpackAuthorize( client_id, data.code, state, redirect_uri, secret );
			} )
			.then( ( data ) => {
				tracksEvent( dispatch, 'calypso_jpc_authorize_success', {
					site: client_id
				} );

				debug( 'Jetpack authorize complete. Updating sites list.', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: data,
					error: null
				} );
				// Update the user now that we are fully connected.
				userModule.fetch();
				return wpcom.me().sites( { site_visibility: 'all' } );
			} )
			.then( ( data ) => {
				tracksEvent( dispatch, 'jpc_auth_sitesrefresh', {
					site: client_id
				} );
				debug( 'Sites list updated!', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
					data: data
				} );
				Dispatcher.handleViewAction( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
					data: data
				} );
			} )
			.catch( ( error ) => {
				tracksEvent( dispatch, 'jpc_auth_error', {
					error: error,
					site: client_id
				} );
				debug( 'Authorize error', error );
				tracksEvent( dispatch, 'calypso_jpc_authorize_error', {
					error: error.code,
					site: client_id
				} );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: null,
					error: error
				} );
			} );
		};
	},
	validateSSONonce( siteId, ssoNonce ) {
		return ( dispatch ) => {
			debug( 'Attempting to validate SSO for ' + siteId );
			dispatch( {
				type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
				siteId
			} );

			return wpcom.undocumented().jetpackValidateSSONonce( siteId, ssoNonce ).then( ( data ) => {
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
					success: data.success
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
					error: pick( error, [ 'error', 'status', 'message' ] )
				} );
			} );
		};
	},
	authorizeSSO( siteId, ssoNonce ) {
		return ( dispatch ) => {
			debug( 'Attempting to authorize SSO for ' + siteId );
			dispatch( {
				type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
				siteId
			} );

			return wpcom.undocumented().jetpackAuthorizeSSONonce( siteId, ssoNonce ).then( ( data ) => {
				dispatch( {
					type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
					ssoUrl: data.sso_url
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
					error: pick( error, [ 'error', 'status', 'message' ] )
				} );
			} );
		};
	},
	activateManage( blogId, state, secret ) {
		return ( dispatch ) => {
			debug( 'Activating manage', blogId );
			dispatch( {
				type: JETPACK_CONNECT_ACTIVATE_MANAGE,
				blogId: blogId
			} );
			wpcom.undocumented().activateManage( blogId, state, secret )
			.then( ( data ) => {
				tracksEvent( dispatch, 'jpc_activate_manage_success' );
				debug( 'Manage activated!', data );
				dispatch( {
					type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
					data: data,
					error: null
				} );
			} )
			.catch( ( error ) => {
				tracksEvent( dispatch, 'jpc_activate_manage_error', { error: error.code } );
				debug( 'Manage activation error', error );
				dispatch( {
					type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
					data: null,
					error: error
				} );
			} );
		};
	}
};
