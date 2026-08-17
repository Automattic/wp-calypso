import {
	transferCompleteStates,
	transferInProgress,
	transferStates,
} from 'calypso/state/automated-transfer/constants';

/**
 * The three coarse stages the customer is shown, mapped from the transfer statuses the
 * server actually reports. Provisioning ('pending'/'active') is one opaque block on the
 * backend, so this is the finest honest granularity available.
 *
 * `finishing` is generous on purpose: after the transfer completes the page still waits on
 * capability propagation, a plugin-list refetch and activation before it can leave.
 */
export const HONEST_STAGES = [
	{ key: 'preparing', expectedSeconds: 25 },
	{ key: 'moving', expectedSeconds: 10 },
	{ key: 'finishing', expectedSeconds: 20 },
] as const;

const MOVING_STATUSES: ReadonlyArray< string | null > = [
	transferStates.PROVISIONED,
	transferStates.RELOCATING,
	transferStates.BACKFILLING,
];

const PREPARING_STATUSES: ReadonlyArray< string | null > = [
	...transferInProgress,
	transferStates.SETUP,
	transferStates.UPLOADING,
];

// Not listed on purpose: `renaming`, `exporting`, `importing`, `cleanup` are the lossless-revert
// pipeline (wpcom `reverts/class-lossless.php`), never a forward step of a transfer. A revert of
// this wait's transfer is a failure, reported by useInstallDeadline rather than shown as a stage.

/**
 * Which honest stage the install is in.
 *
 * Once the transfer reports complete, the plugin install/activation this page dispatches is
 * still running, so completion of the *transfer* maps to the "finishing" stage — the page
 * redirects away when the product is active, which is this screen's real end.
 *
 * While the transfer is known to be in flight its status is authoritative: reaching the
 * activation step (a plugin row that already exists on the site) does not make the move done.
 * Only when no transfer status is known does the page's own step decide.
 */
export function getHonestStage( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ): number {
	if ( transferCompleteStates.includes( transferStatus ) ) {
		return 2;
	}
	if ( MOVING_STATUSES.includes( transferStatus ) ) {
		return 1;
	}
	if ( PREPARING_STATUSES.includes( transferStatus ) ) {
		return 0;
	}
	return currentStep >= 2 ? 2 : 0;
}
