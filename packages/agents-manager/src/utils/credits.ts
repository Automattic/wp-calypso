import { __, sprintf } from '@wordpress/i18n';
import { getBrowserSafeLocale } from 'i18n-calypso';
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

	return Math.min( 100, Math.max( 0, percent ) );
}

/**
 * Whole-number percentage for labels. A positive balance under one percent
 * reads as "<1" rather than "0", since it is still spendable.
 */
export function formatPercent( percent: number ): string {
	const value = clampPercent( percent );

	if ( value > 0 && value < 1 ) {
		return '<1';
	}

	return String( Math.floor( value ) );
}

/** Exhaustion is the exact balance hitting zero; a fraction left still spends. */
export function isCreditsExhausted( status: CreditsStatus ): boolean {
	return clampPercent( status.percent ) <= 0;
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
	const percent = formatPercent( status.percent );

	if ( status.plan === 'paid' ) {
		// The aggregate across the plan and top-up pools, hence "site credits"
		// (the popover's heading), not the monthly allowance alone.
		return sprintf(
			/* translators: %s: percentage of the site's credits left, e.g. "72" or "<1" */
			__( '%s%% of site credits left', __i18n_text_domain__ ),
			percent
		);
	}

	return sprintf(
		/* translators: %s: percentage of free credits left, e.g. "15" or "<1" */
		__( '%s%% of free credits left', __i18n_text_domain__ ),
		percent
	);
}

// The interface locale, not the browser's, so the figures match the
// translated sentence around them. The browser-safe accessor keeps the
// regional variant (`de-ch`) in a form `Intl` accepts.
function formatCredits( value: number ): string {
	const locale = getBrowserSafeLocale() ?? 'en';
	try {
		return value.toLocaleString( locale );
	} catch {
		return value.toLocaleString( 'en' );
	}
}

export function formatCreditsDetail( pool: CreditsPool ): string | undefined {
	if ( pool.remaining === undefined || pool.total === undefined ) {
		return undefined;
	}

	return sprintf(
		/* translators: 1: credits remaining, 2: credits in the pool */
		__( '%1$s of %2$s credits', __i18n_text_domain__ ),
		formatCredits( pool.remaining ),
		formatCredits( pool.total )
	);
}

// Mocked balances until the backend snapshot lands. Plan credits are spent
// before top-ups, so the aggregate drains the plan pool first.
const MOCK_PLAN_TOTAL = 15000;
const MOCK_TOPUPS_TOTAL = 1000;

export function buildMockCreditsStatus( plan: CreditsPlan, percent: number ): CreditsStatus {
	if ( plan === 'paid' ) {
		// Plan credits are spent before top-ups, so the aggregate balance
		// drains the plan pool first and the top-ups pool only after it hits zero.
		const remaining = Math.round( ( ( MOCK_PLAN_TOTAL + MOCK_TOPUPS_TOTAL ) * percent ) / 100 );
		const topupsRemaining = Math.min( MOCK_TOPUPS_TOTAL, remaining );
		const planRemaining = remaining - topupsRemaining;
		return {
			plan,
			percent,
			pools: [
				{
					id: 'plan',
					label: __( 'Monthly plan', __i18n_text_domain__ ),
					percent: ( 100 * planRemaining ) / MOCK_PLAN_TOTAL,
					dateLabel: __( 'Resets 17 Oct', __i18n_text_domain__ ),
					remaining: planRemaining,
					total: MOCK_PLAN_TOTAL,
				},
				{
					id: 'topups',
					label: __( 'Top-ups', __i18n_text_domain__ ),
					percent: ( 100 * topupsRemaining ) / MOCK_TOPUPS_TOTAL,
					dateLabel: __( 'Expires 15 Sep 2027', __i18n_text_domain__ ),
					remaining: topupsRemaining,
					total: MOCK_TOPUPS_TOTAL,
				},
			],
		};
	}

	return {
		plan,
		percent,
		pools: [ { id: 'free', label: __( 'Free credits', __i18n_text_domain__ ), percent } ],
	};
}
