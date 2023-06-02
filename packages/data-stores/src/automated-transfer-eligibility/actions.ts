import { TransferEligibility } from './types';

export const receiveTransferEligibility = (
	transferEligibility: TransferEligibility,
	siteId: number
) => ( {
	type: 'TRANSFER_ELIGIBILITY_RECEIVE' as const,
	transferEligibility,
	siteId,
} );

export type Action =
	| ReturnType< typeof receiveTransferEligibility >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
