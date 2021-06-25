/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { receiveSite } from 'calypso/state/sites/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from 'calypso/state/sites/constants';
import {
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
} from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

export function authorize( queryObject ) {
	return ( dispatch ) => {
		const {
			_wp_nonce,
			client_id,
			from,
			jp_version,
			redirect_uri,
			scope,
			secret,
			state,
		} = queryObject;
		debug( 'Trying Jetpack login.', _wp_nonce, redirect_uri, scope, state );
		dispatch( recordTracksEvent( 'calypso_jpc_authorize', { from, site: client_id } ) );
		dispatch( {
			type: JETPACK_CONNECT_AUTHORIZE,
			queryObject: queryObject,
		} );
		return wpcom
			.undocumented()
			.jetpackLogin( client_id, _wp_nonce, redirect_uri, scope, state )
			.then( ( data ) => {
				debug( 'Jetpack login complete. Trying Jetpack authorize.', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
					data,
				} );
				return wpcom
					.undocumented()
					.jetpackAuthorize( client_id, data.code, state, redirect_uri, secret, jp_version, from );
			} )
			.then( ( data ) => {
				debug( 'Jetpack authorize complete. Updating sites list.', data );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: data,
					error: null,
				} );

				// Update the user now that we are fully connected.
				return dispatch( fetchCurrentUser() );
			} )
			.then( () => {
				// Site may not be accessible yet, so force fetch from wpcom
				return wpcom.site( client_id ).get( {
					force: 'wpcom',
					fields: SITE_REQUEST_FIELDS,
					options: SITE_REQUEST_OPTIONS,
				} );
			} )
			.then( ( data ) => {
				dispatch(
					recordTracksEvent( 'calypso_jpc_auth_sitesrefresh', {
						site: client_id,
					} )
				);
				debug( 'Site updated', data );
				dispatch( receiveSite( data ) );
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
				} );
			} )
			.then( () => {
				dispatch(
					recordTracksEvent( 'calypso_jpc_authorize_success', {
						site: client_id,
						from,
					} )
				);
			} )
			.catch( ( error ) => {
				debug( 'Authorize error', error );
				dispatch(
					recordTracksEvent( 'calypso_jpc_authorize_error', {
						error_code: error.code,
						error_name: error.name,
						error_message: error.message,
						status: error.status,
						error: JSON.stringify( error ),
						site: client_id,
						from,
					} )
				);
				dispatch( {
					type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
					siteId: client_id,
					data: null,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}
