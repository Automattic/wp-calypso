import { __ } from '@wordpress/i18n';

// `reverting` and `relocating_revert` always end at `reverted`, so treat all
// three as final rather than making the user wait for the last one.
const REVERTED_TRANSFER_STATUSES = [ 'reverted', 'reverting', 'relocating_revert' ];

export function isRevertedTransferStatus( status?: string ): boolean {
	return !! status && REVERTED_TRANSFER_STATUSES.includes( status );
}

interface PolledTransfer {
	atomic_transfer_id?: number;
	status?: string;
}

// ~15s at the 3s poll interval every caller uses.
const POLLS_BEFORE_TRUSTING_A_REVERT_SEEN_ON_ARRIVAL = 5;

/**
 * Tells a revert of the transfer being waited on from a revert of an older one.
 * The endpoint returns the site's latest transfer, which early on can still be a
 * previous one — re-upgrading after a downgrade is an ordinary path, and failing
 * on that would break a healthy wait.
 *
 * A revert we watched go in flight is ours. A revert already there on arrival is
 * ambiguous, so we give it a few polls: if it was stale a new transfer takes
 * over, otherwise nothing is coming and it is ours.
 *
 * One watcher per wait; call on every poll.
 */
export function createRevertedTransferWatcher() {
	let transferSeenInFlight: number | undefined;
	let unexplainedRevertId: number | undefined;
	let unexplainedRevertPolls = 0;

	return function isRevertOfThisTransfer( transfer?: PolledTransfer ): boolean {
		if ( ! transfer || transfer.atomic_transfer_id === undefined ) {
			return false;
		}

		const transferId = transfer.atomic_transfer_id;

		if ( ! isRevertedTransferStatus( transfer.status ) ) {
			transferSeenInFlight = transferId;
			unexplainedRevertId = undefined;
			unexplainedRevertPolls = 0;
			return false;
		}

		if ( transferId === transferSeenInFlight ) {
			return true;
		}

		if ( transferId !== unexplainedRevertId ) {
			unexplainedRevertId = transferId;
			unexplainedRevertPolls = 0;
		}

		unexplainedRevertPolls++;

		return unexplainedRevertPolls >= POLLS_BEFORE_TRUSTING_A_REVERT_SEEN_ON_ARRIVAL;
	};
}

export type TransferFailureOutcome = 'reverted' | 'error' | 'timeout';

// Shown to the user on the error step, so these are sentences, not codes. The
// machine-readable outcome goes separately, via handleTransferFailure.
export function getTransferFailureMessage( outcome: TransferFailureOutcome ): string {
	switch ( outcome ) {
		case 'reverted':
			return __( "We stopped setting up your site because the upgrade didn't go through." );
		case 'timeout':
			return __( 'Setting up your site is taking longer than expected.' );
		default:
			return __( 'Something went wrong while setting up your site.' );
	}
}
