/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
} from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

export function authorizeSSO( siteId, ssoNonce, siteUrl ) {
	return ( dispatch ) => {
		debug( 'Attempting to authorize SSO for ' + siteId );
		dispatch( {
			type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.jetpackAuthorizeSSONonce( siteId, ssoNonce )
			.then( ( data ) => {
				dispatch( recordTracksEvent( 'calypso_jpc_authorize_sso_success' ) );
				dispatch( {
					type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
					ssoUrl: data.sso_url,
					siteUrl,
				} );
			} )
			.catch( ( error ) => {
				dispatch(
					recordTracksEvent( 'calypso_jpc_authorize_sso_error', {
						error: error,
					} )
				);
				dispatch( {
					type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}
