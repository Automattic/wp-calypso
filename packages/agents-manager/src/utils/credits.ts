import { __, sprintf } from '@wordpress/i18n';
import type { ProgressRingTone } from '@automattic/agenttic-ui';

export type CreditsPlan = 'free' | 'paid';

/** One balance shown as a row in the credits popover. */
export interface CreditsPool {
	id: 'free' | 'plan' | 'topups';
	label: string;
	/** Remaining share of this pool, 0–100. */
	percent: number;
	/** Reset or expiry, already formatted for display. */
	dateLabel?: string;
	remaining?: number;
	total?: number;
}

export interface CreditsStatus {
	plan: CreditsPlan;
	/** Overall remaining share, 0–100; drives the ring and tooltip. */
	percent: number;
	pools: CreditsPool[];
}

/** Free-plan balance at or below this reads as low. */
export const CREDITS_LOW_THRESHOLD = 20;

export function clampPercent( percent: number ): number {
	if ( ! Number.isFinite( percent ) ) {
		return 0;
	}

	return Math.min( 100, Math.max( 0, Math.floor( percent ) ) );
}

export function isCreditsExhausted( status: CreditsStatus ): boolean {
	return clampPercent( status.percent ) === 0;
}

export function isCreditsLow(
	status: CreditsStatus,
	threshold: number = CREDITS_LOW_THRESHOLD
): boolean {
	return status.plan === 'free' && ! isCreditsExhausted( status ) && status.percent <= threshold;
}

/**
 * Paid plans read as muted so the ring never competes with Send; free plans
 * switch to the error tone once low or exhausted.
 */
export function getCreditsTone(
	status: CreditsStatus,
	threshold: number = CREDITS_LOW_THRESHOLD
): ProgressRingTone {
	if ( status.plan === 'paid' ) {
		return 'muted';
	}

	return isCreditsLow( status, threshold ) || isCreditsExhausted( status ) ? 'error' : 'primary';
}

/** Tooltip and screen-reader sentence for the ring. */
export function getCreditsLabel( status: CreditsStatus ): string {
	const percent = clampPercent( status.percent );

	if ( status.plan === 'paid' ) {
		return sprintf(
			/* translators: %d: percentage of the monthly credit allowance left */
			__( '%d%% of monthly credits left', __i18n_text_domain__ ),
			percent
		);
	}

	return sprintf(
		/* translators: %d: percentage of free credits left */
		__( '%d%% of free credits left', __i18n_text_domain__ ),
		percent
	);
}

export function formatCreditsDetail( pool: CreditsPool ): string | undefined {
	if ( pool.remaining === undefined || pool.total === undefined ) {
		return undefined;
	}

	return sprintf(
		/* translators: 1: credits remaining, 2: credits in the pool */
		__( '%1$s of %2$s credits', __i18n_text_domain__ ),
		pool.remaining.toLocaleString(),
		pool.total.toLocaleString()
	);
}
