/**
 * External dependencies
 */
import { omit } from 'lodash/object';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Receives the status of a guided transfer for a particular site
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} guidedTransferStatus The current status of the guided transfer
 * @returns {Object} An action object
 */
export function receiveGuidedTransferStatus( siteId, guidedTransferStatus ) {
	return {
		type: GUIDED_TRANSFER_STATUS_RECEIVE,
		siteId,
		guidedTransferStatus,
	};
}

/**
 * Requests the status of guided transfer for a particular site
 *
 * @param {number} siteId The site ID to which the status belongs
 * @returns {Thunk} Action thunk
 */
export function requestGuidedTransferStatus( siteId ) {
	return ( dispatch ) => {
		dispatch( { type: GUIDED_TRANSFER_STATUS_REQUEST, siteId } );

		const success = response => {
			const guidedTransferStatus = omit( response, '_headers' );

			dispatch( {
				type: GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
				siteId
			} );

			dispatch( receiveGuidedTransferStatus( siteId, guidedTransferStatus ) );
		};

		const failure = error => dispatch( {
			type: GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
			siteId,
			error,
		} );

		return wpcom.undocumented().getGuidedTransferStatus( siteId )
			.then( success )
			.catch( failure );
	};
}
