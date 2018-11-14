/** @format */

/**
 * External dependencies
 */
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import { ATOMIC_TRANSFER_REQUEST } from 'state/action-types';
import { recordTracksEvent } from 'state/analytics/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { requestSite } from 'state/sites/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	fetchAtomicTransfer,
	setAtomicTransfer,
	atomicTransferFetchingFailure,
	atomicTransferComplete,
} from 'state/atomic-transfer/actions';
import { transferStates } from 'state/atomic-transfer/constants';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestTransfer = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/transfers/latest`,
				apiVersion: '1.2',
			},
			action
		)
	);
};

export const receiveTransfer = ( { dispatch }, { siteId }, transfer ) => {
	dispatch( setAtomicTransfer( siteId, transfer ) );

	const status = transfer.status;
	if ( status !== transferStates.ERROR && status !== transferStates.COMPLETED ) {
		delay( dispatch, 10000, fetchAtomicTransfer( siteId ) );
	}

	if ( status === transferStates.COMPLETED ) {
		dispatch(
			recordTracksEvent( 'calypso_atomic_transfer_complete', {
				transfer_id: transfer.atomic_transfer_id,
			} )
		);

		dispatch( atomicTransferComplete( siteId ) );
		// Update the now-atomic site to ensure plugin page displays correctly.
		dispatch( requestSite( siteId ) );
	}
};

export const requestingTransferFailure = ( { dispatch }, { siteId } ) => {
	dispatch( atomicTransferFetchingFailure( siteId ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfer/index.js', {
	[ ATOMIC_TRANSFER_REQUEST ]: [
		dispatchRequest( requestTransfer, receiveTransfer, requestingTransferFailure ),
	],
} );
