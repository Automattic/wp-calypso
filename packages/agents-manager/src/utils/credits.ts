import { __, _n, sprintf } from '@wordpress/i18n';
import type { ContextProvider } from '@automattic/agenttic-client';

export type CreditsPlan = 'free' | 'paid';
export type CreditsPlanTier = 'personal' | 'premium' | 'business' | 'commerce';

/** One balance shown as a row in the credits popover. */
export type CreditsPool =
	| {
			id: 'free' | 'plan';
			label: string;
			/** Remaining share of this pool, 0–100. */
			percent: number;
			/** Reset or expiry, already formatted for display. */
			dateLabel?: string;
			remaining?: number;
			total?: number;
	  }
	| {
			/** Top-ups have no allowance or reset, so the row shows their balance alone. */
			id: 'topups';
			label: string;
			remaining: number;
			percent?: never;
			dateLabel?: never;
			total?: never;
	  };

interface CreditsStatusBase {
	/** Known paid tier supplied by the server; absent for older or unsupported metadata. */
	planTier?: CreditsPlanTier;
	/** Overall remaining share, 0–100; drives the free-plan meter, tooltip and notice. */
	percent: number;
	pools: CreditsPool[];
}

export type CreditsStatus =
	| ( CreditsStatusBase & {
			plan: 'free';
			/** Exact balance when a server supplies one, which demo mode doesn't. */
			remaining?: number;
	  } )
	| ( CreditsStatusBase & {
			plan: 'paid';
			/** Exact balance across the plan and top-ups; display rounding never drives gating. */
			remaining: number;
	  } );

/** Free-plan low-balance percentage, for the alert icon and the notice. */
const CREDITS_LOW_THRESHOLD = 20;

/** Paid balance, in credits, below which the meter shows its alert icon and the low-balance notice. */
export const CREDITS_LOW_BALANCE = 10000;

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

/**
 * Low but not exhausted: paid plans by the combined balance against
 * `CREDITS_LOW_BALANCE`, free plans by percentage against `CREDITS_LOW_THRESHOLD`.
 */
export function isCreditsLow( status: CreditsStatus ): boolean {
	if ( isCreditsExhausted( status ) ) {
		return false;
	}

	return status.plan === 'paid'
		? status.remaining < CREDITS_LOW_BALANCE
		: status.percent <= CREDITS_LOW_THRESHOLD;
}

/** Whether the meter shows its alert icon: low or exhausted, by the same rule as the credits notices. */
export function isCreditsAlert( status: CreditsStatus ): boolean {
	return isCreditsLow( status ) || isCreditsExhausted( status );
}

/**
 * The top-ups row's balance, as the credits Tracks events send it, so a used-up pack sends 0.
 * `none` when no row shows: no purchases, or unreadable ones.
 */
export function getTopUpCreditsLeft( status: CreditsStatus ): number | 'none' {
	return status.pools.find( ( pool ) => pool.id === 'topups' )?.remaining ?? 'none';
}

/**
 * The client context's `environment`, as the credits Tracks events send it: unchanged, as the
 * server's credit events do. `none` when it's missing or the context can't be read.
 */
export function getAgentEnvironment( contextProvider?: ContextProvider ): string {
	try {
		const environment = contextProvider?.getClientContext().environment;
		return typeof environment === 'string' && environment !== '' ? environment : 'none';
	} catch {
		return 'none';
	}
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

/** An amount of credits left as a sentence, e.g. "67k credits left". */
export function formatCreditsLeft( credits: number ): string {
	return sprintf(
		/* translators: %s: site credits left in short form, e.g. "800" or "10.8k" */
		_n( '%s credit left', '%s credits left', credits, __i18n_text_domain__ ),
		formatCreditsShort( credits )
	);
}

/** Credits left as a sentence: an amount on paid plans, a percentage on free ones. */
export function getCreditsLabel( status: CreditsStatus ): string {
	if ( status.plan === 'paid' ) {
		// The combined balance across the plan and top-ups, not the monthly allowance alone.
		return formatCreditsLeft( status.remaining );
	}

	return sprintf(
		/* translators: %s: percentage of free credits left, e.g. "15" or "<1" */
		__( '%s%% of free credits left', __i18n_text_domain__ ),
		formatPercent( status.percent )
	);
}

/** The meter toggle's label and tooltip: the amount, led by the state when low or out. */
export function getCreditsToggleLabel( status: CreditsStatus ): string {
	const label = getCreditsLabel( status );
	if ( isCreditsExhausted( status ) ) {
		return sprintf(
			/* translators: %s: credits left, e.g. "0 credits left" or "0% of free credits left" */
			__( 'Out of credits: %s', __i18n_text_domain__ ),
			label
		);
	}
	if ( isCreditsLow( status ) ) {
		return sprintf(
			/* translators: %s: credits left, e.g. "9.9k credits left" or "15% of free credits left" */
			__( 'Low on credits: %s', __i18n_text_domain__ ),
			label
		);
	}
	return label;
}

export function formatCreditsDetail( pool: CreditsPool ): string | undefined {
	if ( pool.remaining === undefined || pool.total === undefined ) {
		return undefined;
	}

	return sprintf(
		/* translators: 1: credits left in the pool, 2: credits in the pool (sets the plural), both in short form, e.g. "10.8k" and "15k" */
		_n( '%1$s of %2$s credit left', '%1$s of %2$s credits left', pool.total, __i18n_text_domain__ ),
		formatCreditsShort( pool.remaining ),
		formatCreditsShort( pool.total )
	);
}

// Demo-mode balances for chats with no live site (`?am_credits`). Plan credits
// are spent before top-ups, so the aggregate drains the plan pool first.
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
					remaining: topupsRemaining,
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
