/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import wpcom from 'lib/wp';
import { receiveSite } from 'state/sites/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from 'state/sites/constants';
import {
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
} from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

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
				const user = userFactory();
				user.fetching = false;
				user.fetch();

				// @TODO: When user fetching is reduxified, let's get rid of this hack.
				// Currently, we need it to make sure user has been refetched before we continue.
				// Otherwise the user might see a confusing message that they have no sites.
				// See p8oabR-j3-p2/#comment-2399 for more information.
				return new Promise( ( resolve ) => {
					const userFetched = setInterval( () => {
						const loadedUser = user.get();
						if ( loadedUser ) {
							clearInterval( userFetched );
							resolve( loadedUser );
						}
					}, 100 );
				} );
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
