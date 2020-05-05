/**
 * External dependencies
 */
import debugModule from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
} from 'state/action-types';

/**
 *  Local variables;
 */
const debug = debugModule( 'calypso:state:jetpack-sync:actions' );

export function getSyncStatus( siteId ) {
	return ( dispatch ) => {
		debug( 'Getting sync status for: ' + siteId );
		dispatch( {
			type: JETPACK_SYNC_STATUS_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.getJetpackSyncStatus( siteId )
			.then( ( data ) => {
				dispatch( {
					type: JETPACK_SYNC_STATUS_SUCCESS,
					siteId,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_SYNC_STATUS_ERROR,
					siteId,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}

export function scheduleJetpackFullysync( siteId ) {
	return ( dispatch ) => {
		debug( 'Requesting full sync for: ' + siteId );
		dispatch( {
			type: JETPACK_SYNC_START_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.scheduleJetpackFullysync( siteId )
			.then( ( data ) => {
				dispatch( {
					type: JETPACK_SYNC_START_SUCCESS,
					siteId,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_SYNC_START_ERROR,
					siteId,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}
