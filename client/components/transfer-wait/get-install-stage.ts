import {
	transferCompleteStates,
	transferInProgress,
	transferStates,
} from 'calypso/state/automated-transfer/constants';

/**
 * The three coarse stages the customer is shown, mapped from the transfer statuses the
 * server actually reports. Provisioning ('pending'/'active') is one opaque block on the
 * backend, so this is the finest granularity the statuses support.
 *
 * `finishing` is generous on purpose: after the transfer completes the page still waits on
 * capability propagation, a plugin-list refetch and activation before it can leave.
 */
export const INSTALL_STAGES = [
	{ key: 'preparing', expectedSeconds: 25 },
	{ key: 'moving', expectedSeconds: 10 },
	{ key: 'finishing', expectedSeconds: 20 },
] as const;

export type InstallStageKey = ( typeof INSTALL_STAGES )[ number ][ 'key' ];

const MOVING_STATUSES: ReadonlyArray< string | null > = [
	transferStates.PROVISIONED,
	transferStates.RELOCATING,
	transferStates.BACKFILLING,
];

// `transferInProgress` contains `provisioned`, which belongs to `moving` above. Subtracting it here
// keeps the two lists disjoint, so the stage a status maps to does not depend on the order the
// branches below happen to be written in.
const PREPARING_STATUSES: ReadonlyArray< string | null > = [
	...transferInProgress.filter( ( status ) => ! MOVING_STATUSES.includes( status ) ),
	transferStates.SETUP,
	transferStates.UPLOADING,
];

// Not listed on purpose: `renaming`, `exporting`, `importing`, `cleanup` are the lossless-revert
// pipeline (wpcom `reverts/class-lossless.php`), never a forward step of a transfer. A revert of
// this wait's transfer is a failure, reported by useInstallDeadline rather than shown as a stage.

/**
 * Which stage the wait is in.
 *
 * Work remains after the transfer reports complete — the plugin install and activation on the
 * marketplace path, the rest of setup on the hosted-site path — so completion of the *transfer*
 * maps to the "finishing" stage, and the caller redirects away once that work is done.
 *
 * While the transfer is known to be in flight its status is authoritative: a later fallbackStep
 * (on the marketplace path, a plugin row that already exists on the site) does not make the move
 * done. Only when no transfer status is known does the caller's own step decide.
 */
export function getInstallStage( {
	transferStatus,
	fallbackStep = 0,
}: {
	transferStatus: string | null;
	fallbackStep?: number;
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
	return fallbackStep >= 2 ? 2 : 0;
}
