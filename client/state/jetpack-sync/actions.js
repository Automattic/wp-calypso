import debugModule from 'debug';
import { pick } from 'lodash';
import wpcom from 'calypso/lib/wp';
import {
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
} from 'calypso/state/action-types';

import 'calypso/state/jetpack-sync/init';

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

		return wpcom.req
			.get( { path: `/sites/${ siteId }/sync/status` } )
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

		return wpcom.req
			.post( { path: `/sites/${ siteId }/sync` }, {} )
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
