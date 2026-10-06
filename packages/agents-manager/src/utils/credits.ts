import { __, sprintf } from '@wordpress/i18n';
import type { ProgressRingTone } from '@automattic/agenttic-ui';

export type CreditsPlan = 'free' | 'paid';
export type CreditsPlanTier = 'personal' | 'premium' | 'business' | 'commerce';

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

interface CreditsStatusBase {
	/** Known paid tier supplied by the server; absent for older or unsupported metadata. */
	planTier?: CreditsPlanTier;
	/** Overall remaining share, 0–100; drives the ring and the free-plan tooltip. */
	percent: number;
	pools: CreditsPool[];
}

export type CreditsStatus =
	| ( CreditsStatusBase & { plan: 'free'; remaining?: number } )
	| ( CreditsStatusBase & {
			plan: 'paid';
			/** Exact balance across the plan and top-ups; display rounding never drives gating. */
			remaining: number;
	  } );

/** Low-balance percentage for the ring tone and the free-plan notice. */
export const CREDITS_LOW_THRESHOLD = 20;

/** Paid balance, in credits, below which the low-balance notice shows. */
export const CREDITS_LOW_BALANCE = 20000;

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
	return status.remaining !== undefined
		? status.remaining === 0
		: clampPercent( status.percent ) <= 0;
}

export function isCreditsLow(
	status: CreditsStatus,
	threshold: number = CREDITS_LOW_THRESHOLD
): boolean {
	return status.plan === 'free' && ! isCreditsExhausted( status ) && status.percent <= threshold;
}

/**
 * Low or exhausted balances use the error tone on every plan. Above the
 * threshold, paid plans stay muted and free plans use the primary tone.
 */
export function getCreditsTone(
	status: CreditsStatus,
	threshold: number = CREDITS_LOW_THRESHOLD
): ProgressRingTone {
	if ( status.percent <= threshold || isCreditsExhausted( status ) ) {
		return 'error';
	}

	return status.plan === 'paid' ? 'muted' : 'primary';
}

/**
 * Credits in short form: in full under 1,000, then in thousands with one
 * decimal and a "k", rounded down so it never shows more than the site has.
 * The number follows the browser's language.
 */
export function formatCreditsShort( credits: number ): string {
	if ( credits < 1000 ) {
		return credits.toLocaleString();
	}

	return sprintf(
		/* translators: %s: thousands of credits, e.g. "8.5" or "67"; "k" abbreviates thousands */
		__( '%sk', __i18n_text_domain__ ),
		( Math.floor( credits / 100 ) / 10 ).toLocaleString( undefined, { maximumFractionDigits: 1 } )
	);
}

/** Tooltip and screen-reader sentence for the ring. */
export function getCreditsLabel( status: CreditsStatus ): string {
	if ( status.plan === 'paid' ) {
		// The combined balance across the plan and top-ups, not the monthly allowance alone.
		return sprintf(
			/* translators: %s: site credits left in short form, e.g. "800" or "10.8k" */
			__( '%s credits left', __i18n_text_domain__ ),
			formatCreditsShort( status.remaining )
		);
	}

	return sprintf(
		/* translators: %s: percentage of free credits left, e.g. "15" or "<1" */
		__( '%s%% of free credits left', __i18n_text_domain__ ),
		formatPercent( status.percent )
	);
}

export function formatCreditsDetail( pool: CreditsPool ): string | undefined {
	if ( pool.remaining === undefined || pool.total === undefined ) {
		return undefined;
	}

	return sprintf(
		/* translators: 1: credits left in the pool, 2: credits in the pool, both in short form, e.g. "10.8k" and "15k" */
		__( '%1$s of %2$s credits left', __i18n_text_domain__ ),
		formatCreditsShort( pool.remaining ),
		formatCreditsShort( pool.total )
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
			remaining,
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
