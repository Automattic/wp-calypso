/**
 * External dependencies
 */
import {
	flowRight as compose,
	get,
	partialRight,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_STATUS as transferStates,
} from './constants';

export const getAutomatedTransfer = ( state, siteId ) =>
	get( state, [ 'automatedTransfer', siteId ], {} );

export const getAutomatedTransferStatus = compose(
	partialRight( get, 'status', transferStates.ALOOF ),
	getAutomatedTransfer,
);

export const getEligibility = compose(
	partialRight( get, 'eligibility', { lastUpdate: 0 } ),
	getAutomatedTransfer,
);
