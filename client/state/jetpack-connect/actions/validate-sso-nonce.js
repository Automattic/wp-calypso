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
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
} from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

export function validateSSONonce( siteId, ssoNonce ) {
	return ( dispatch ) => {
		debug( 'Attempting to validate SSO for ' + siteId );
		dispatch( {
			type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.jetpackValidateSSONonce( siteId, ssoNonce )
			.then( ( data ) => {
				dispatch( recordTracksEvent( 'calypso_jpc_validate_sso_success' ) );
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
					success: data.success,
					blogDetails: data.blog_details,
					sharedDetails: data.shared_details,
				} );
			} )
			.catch( ( error ) => {
				dispatch(
					recordTracksEvent( 'calypso_jpc_validate_sso_error', {
						error: error,
					} )
				);
				dispatch( {
					type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}
