import { __ } from '@wordpress/i18n';

// The full status vocabulary the transfer wait loops understand. Kept in one
// place so every wait recognises the same outcomes.
export const transferStates = {
	PENDING: 'pending',
	ACTIVE: 'active',
	PROVISIONED: 'provisioned',
	COMPLETED: 'completed',
	ERROR: 'error',
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	RELOCATING_SWITCHEROO: 'relocating_switcheroo',
	REVERTING: 'reverting',
	RENAMING: 'renaming',
	EXPORTING: 'exporting',
	IMPORTING: 'importing',
	CLEANUP: 'cleanup',
} as const;

// `reverting` and `relocating_revert` always end at `reverted`, so treat all
// three as final rather than making the user wait for the last one.
const REVERTED_TRANSFER_STATUSES: string[] = [
	transferStates.REVERTED,
	transferStates.REVERTING,
	transferStates.RELOCATING_REVERT,
];

// The statuses that mean this endpoint's transfer is still moving forward, `relocating_switcheroo`
// included: it is the switch-over, the last forward step, and wpcom's own `is_wpcom_atomic()` reads
// it alongside `completed`. Deliberately not `calypso/state/automated-transfer`'s `transferInProgress`,
// which answers for a different, narrower vocabulary — it has no `relocating_switcheroo` and carries
// a `start` this endpoint never returns. The revert pipeline below belongs to a previous transfer.
const FORWARD_TRANSFER_STATUSES: string[] = [
	transferStates.PENDING,
	transferStates.ACTIVE,
	transferStates.PROVISIONED,
	transferStates.RELOCATING_SWITCHEROO,
];

export function isForwardTransferStatus( status?: string | null ): boolean {
	return !! status && FORWARD_TRANSFER_STATUSES.includes( status );
}

export function isRevertedTransferStatus( status?: string ): boolean {
	return !! status && REVERTED_TRANSFER_STATUSES.includes( status );
}

interface PolledTransfer {
	atomic_transfer_id?: number;
	status?: string;
}

/**
 * Reports a revert of the transfer being waited on, and only that.
 *
 * The endpoint returns the site's latest transfer, not the one we asked about, so a revert is only
 * ours once we have watched that same transfer id moving forward. Ownership comes from a forward
 * status alone: the lossless-revert pipeline (`renaming`, `exporting`, `importing`, `cleanup`) also
 * looks non-final, but it is a previous transfer tidying up — and a site that was Atomic before is
 * exactly the case these waits are slowest for. Early in a wait the latest transfer can still be an
 * older one, and failing on that would break a healthy wait.
 *
 * Known gap: a transfer already reverted before our first poll is indistinguishable
 * from stale history without a transfer id to correlate against, so it falls
 * through to the caller's timeout. See DOTCOM-18112.
 *
 * One watcher per wait; call on every poll.
 */
export function createRevertedTransferWatcher() {
	let transferSeenInFlight: number | undefined;

	return function isRevertOfThisTransfer( transfer?: PolledTransfer ): boolean {
		if ( ! transfer || transfer.atomic_transfer_id === undefined ) {
			return false;
		}

		const transferId = transfer.atomic_transfer_id;

		if ( isForwardTransferStatus( transfer.status ) ) {
			transferSeenInFlight = transferId;
			return false;
		}

		if ( isRevertedTransferStatus( transfer.status ) ) {
			return transferId === transferSeenInFlight;
		}

		return false;
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
