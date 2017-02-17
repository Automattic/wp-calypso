/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:jetpack-connect:actions' );
import pick from 'lodash/pick';
import page from 'page';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'state/analytics/actions';
import Dispatcher from 'dispatcher';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_ACTIVATE_MANAGE,
	JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
	JETPACK_CONNECT_REDIRECT,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
	JETPACK_CONNECT_RETRY_AUTH,
	JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR
} from 'state/action-types';
import userFactory from 'lib/user';
import config from 'config';
import addQueryArgs from 'lib/route/add-query-args';
import { externalRedirect } from 'lib/route/path';
import { urlToSlug } from 'lib/url';
import { JPC_PLANS_PAGE } from './constants';

/**
 *  Local variables;
 */
const _fetching = {};
const calypsoEnv = config( 'env_id' );
const remoteAuthPath = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true&calypso_env=' + calypsoEnv;
const remoteInstallPath = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';
const remoteActivatePath = '/wp-admin/plugins.php';
const tracksEvent = ( dispatch, eventName, props ) => {
	setTimeout( () => {
		dispatch( recordTracksEvent( eventName, props ) );
	}, 1 );
};

export default {
	confirmJetpackInstallStatus( status ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: status
			} );
		};
	},

	dismissUrl( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: url
			} );
		};
	},

	checkUrl( url, isUrlOnSites, flowType ) {
		return ( dispatch ) => {
			if ( _fetching[ url ] ) {
				return;
			}

			if ( isUrlOnSites ) {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL,
					url: url,
					flowType: flowType
				} );
				setTimeout( () => {
					dispatch( {
						type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
						url: url,
						data: {
							exists: true,
							isWordPress: true,
							hasJetpack: true,
							isJetpackActive: true,
							isJetpackConnected: true,
							isWordPressDotCom: false,
							userOwnsSite: true
						},
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
					flowType: flowType
				} );
			}, 1 );
			Promise.all( [
				wpcom.undocumented().getSiteConnectInfo( url, 'exists' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isWordPress' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'hasJetpack' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isJetpackActive' ),
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

				if ( error ) {
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
	goToPlans( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT,
				url: url
			} );
			tracksEvent( dispatch, 'calypso_jpc_success_redirect', {
				url: url,
				type: 'plans_selection'
			} );

			page.redirect( JPC_PLANS_PAGE + urlToSlug( url ) );
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
			debug( 'goToRemoteAuth', url );
			externalRedirect(
				addQueryArgs( {
					calypso_env: calypsoEnv
				}, url + remoteAuthPath )
			);
		};
	},
	retryAuth( url, attemptNumber ) {
		return ( dispatch ) => {
			debug( 'retrying auth', url, attemptNumber );
			dispatch( {
				type: JETPACK_CONNECT_RETRY_AUTH,
				attemptNumber: attemptNumber,
				slug: urlToSlug( url )
			} );
			tracksEvent( dispatch, 'calypso_jpc_retry_auth', {
				url: url,
				attempt: attemptNumber
			} );
			debug( 'retryAuth', url );
			externalRedirect(
				addQueryArgs( {
					jetpack_connect_url: url + remoteAuthPath,
					calypso_env: calypsoEnv,
					auth_type: 'jetpack'
				}, url + remoteAuthPath )
			);
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
            // TODO: set 'calypso_env' cookie on jetpack.wordpress.com before redirecting
			externalRedirect(
				addQueryArgs( {
					calypso_env: calypsoEnv
				}, url + remoteInstallPath )
			);
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
			// TODO: set 'calypso_env' cookie on jetpack.wordpress.com before redirecting
			externalRedirect(
				addQueryArgs( {
					calypso_env: calypsoEnv
				}, url + remoteActivatePath )
			);
		};
	},
	goBackToWpAdmin( url ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT_WP_ADMIN
			} );
			debug( 'goBackToWpAdmin', url );
			externalRedirect( url );
		};
	},
	goToXmlrpcErrorFallbackUrl( queryObject, authorizationCode ) {
		return ( dispatch ) => {
			const url = addQueryArgs(
				{ code: authorizationCode, state: queryObject.state },
				queryObject.redirect_uri
			);
			dispatch( {
				type: JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
				url
			} );
			debug( 'goToXmlrpcErrorFallbackUrl', queryObject, authorizationCode );
			externalRedirect( url );
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
						tracksEvent( dispatch,
							'calypso_jpc_create_account_error',
							{
								error_code: error.code,
								error: JSON.stringify( error )
							}
						);
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
			return wpcom.undocumented().jetpackLogin( client_id, _wp_nonce, redirect_uri, scope, state )
			.then( ( data ) => {
				debug( 'Jetpack login complete. Trying Jetpack authorize.', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
					data
				} );
				return wpcom.undocumented().jetpackAuthorize( client_id, data.code, state, redirect_uri, secret );
			} )
			.then( ( data ) => {
				tracksEvent( dispatch, 'calypso_jpc_authorize_success', {
					site: client_id,
					from: queryObject && queryObject.from
				} );

				debug( 'Jetpack authorize complete. Updating sites list.', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: data,
					error: null
				} );
				// Update the user now that we are fully connected.
				userFactory().fetch();
				return wpcom.me().sites( { site_visibility: 'all' } );
			} )
			.then( ( data ) => {
				tracksEvent( dispatch, 'calypso_jpc_auth_sitesrefresh', {
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
				debug( 'Authorize error', error );
				tracksEvent( dispatch, 'calypso_jpc_authorize_error', {
					error_code: error.code,
					error_name: error.name,
					error_message: error.message,
					status: error.status,
					error: JSON.stringify( error ),
					site: client_id
				} );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: null,
					error: pick( error, [ 'error', 'status', 'message' ] )
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
				tracksEvent( dispatch, 'calypso_jpc_validate_sso_success' );
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
					success: data.success,
					blogDetails: data.blog_details,
					sharedDetails: data.shared_details
				} );
			} ).catch( ( error ) => {
				tracksEvent( dispatch, 'calypso_jpc_validate_sso_error', {
					error: error
				} );
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
					error: pick( error, [ 'error', 'status', 'message' ] )
				} );
			} );
		};
	},
	authorizeSSO( siteId, ssoNonce, siteUrl ) {
		return ( dispatch ) => {
			debug( 'Attempting to authorize SSO for ' + siteId );
			dispatch( {
				type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
				siteId
			} );

			return wpcom.undocumented().jetpackAuthorizeSSONonce( siteId, ssoNonce ).then( ( data ) => {
				tracksEvent( dispatch, 'calypso_jpc_authorize_sso_success' );
				dispatch( {
					type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
					ssoUrl: data.sso_url,
					siteUrl
				} );
			} ).catch( ( error ) => {
				tracksEvent( dispatch, 'calypso_jpc_authorize_sso_error', {
					error: error
				} );
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
			return wpcom.undocumented().activateManage( blogId, state, secret )
			.then( ( data ) => {
				tracksEvent( dispatch, 'calypso_jpc_activate_manage_success' );
				debug( 'Manage activated!', data );
				dispatch( {
					type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
					data: data,
					error: null
				} );
			} )
			.catch( ( error ) => {
				tracksEvent( dispatch, 'calypso_jpc_activate_manage_error', { error_code: error.code, error: JSON.stringify( error ) } );
				debug( 'Manage activation error', error );
				dispatch( {
					type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
					data: null,
					error: pick( error, [ 'error', 'status', 'message' ] )
				} );
			} );
		};
	},
	selectPlanInAdvance( planSlug, site ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE,
				plan: planSlug,
				site: site
			} );
		};
	},
	completeFlow( site ) {
		return ( dispatch ) => {
			dispatch( {
				type: JETPACK_CONNECT_COMPLETE_FLOW,
				site
			} );
		};
	}
};
