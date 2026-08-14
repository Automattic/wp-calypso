import { transferCompleteStates, transferStates } from 'calypso/state/automated-transfer/constants';

/**
 * The three coarse stages the customer is shown, mapped from the transfer statuses the
 * server actually reports. Provisioning ('pending'/'active') is one opaque block on the
 * backend, so this is the finest honest granularity available.
 */
export const HONEST_STAGES = [
	{ key: 'preparing', expectedSeconds: 25 },
	{ key: 'moving', expectedSeconds: 10 },
	{ key: 'finishing', expectedSeconds: 10 },
] as const;

const MOVING_STATUSES: ReadonlyArray< string | null > = [
	transferStates.PROVISIONED,
	transferStates.RELOCATING,
	transferStates.BACKFILLING,
];

/**
 * Which honest stage the install is in.
 *
 * Once the transfer reports complete, the plugin install/activation this page dispatches is
 * still running, so completion of the *transfer* maps to the "finishing" stage — the page
 * redirects away when the product is active, which is this screen's real end.
 */
export function getHonestStage( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ): number {
	if ( currentStep >= 2 || transferCompleteStates.includes( transferStatus ) ) {
		return 2;
	}
	if ( MOVING_STATUSES.includes( transferStatus ) ) {
		return 1;
	}
	return 0;
}
