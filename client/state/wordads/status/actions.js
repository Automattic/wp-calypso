/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	WORDADS_STATUS_REQUEST,
	WORDADS_STATUS_REQUEST_SUCCESS,
	WORDADS_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { pick } from 'lodash';

export function requestWordadsStatus( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: WORDADS_STATUS_REQUEST,
			siteId
		} );
		return wpcom.undocumented().getWordadsStatus( siteId ).then( ( status ) => {
			dispatch( {
				type: WORDADS_STATUS_REQUEST_SUCCESS,
				siteId,
				status: pick( status, [ 'approved', 'unsafe', 'active' ] )
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: WORDADS_STATUS_REQUEST_FAILURE,
				siteId,
				error
			} );
		} );
	};
}
