import {
	TRANSFER_ELIGIBILITY_RECEIVE,
	TRANSFER_ELIGIBILITY_REQUEST,
	TRANSFER_ELIGIBILITY_REQUEST_FAILURE,
	LATEST_TRANSFER_RECEIVE,
	LATEST_TRANSFER_RECEIVE_FAILURE,
} from './constants';
import { TransferEligibility, AtomicTransfer } from './types';

export function createActions() {
	const receiveTransferEligibility = (
		transferEligibility: TransferEligibility,
		siteId: number
	) => {
		return {
			type: TRANSFER_ELIGIBILITY_RECEIVE,
			transferEligibility,
			siteId,
		};
	};

	const requestTransferEligibility = () => ( {
		type: TRANSFER_ELIGIBILITY_REQUEST,
	} );

	const receiveTransferEligibilityFailure = ( error: any, siteId: number ) => ( {
		type: TRANSFER_ELIGIBILITY_REQUEST_FAILURE,
		error,
		siteId,
	} );

	const receiveLatestAtomicTransfer = ( transfer: AtomicTransfer, siteId: number ) => ( {
		type: LATEST_TRANSFER_RECEIVE,
		transfer,
		siteId,
	} );

	const receiveLatestAtomicTransferFailure = ( error: any, siteId: number ) => ( {
		type: LATEST_TRANSFER_RECEIVE_FAILURE,
		siteId,
		error,
	} );

	return {
		receiveTransferEligibility,
		requestTransferEligibility,
		receiveTransferEligibilityFailure,
		receiveLatestAtomicTransfer,
		receiveLatestAtomicTransferFailure,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'receiveTransferEligibility' ]
			| ActionCreators[ 'requestTransferEligibility' ]
			| ActionCreators[ 'receiveTransferEligibilityFailure' ]
			| ActionCreators[ 'receiveLatestAtomicTransfer' ]
			| ActionCreators[ 'receiveLatestAtomicTransferFailure' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
