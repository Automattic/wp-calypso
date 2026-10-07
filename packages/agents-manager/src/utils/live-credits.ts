import { __, sprintf } from '@wordpress/i18n';
import { getBrowserSafeLocale } from 'i18n-calypso';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import type { CreditsPlanTier, CreditsStatus } from './credits';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { AgentsManagerSite } from '@automattic/data-stores';

/** The opted-in allowance draft's terminal result.ai_credits contract. */
export interface CreditSnapshot {
	schema_version: 1;
	policy_id: 'wpcom-site-monthly-v1' | 'wpcom-site-plan-period-v1';
	cost_version: 'provider-cost-v1';
	accounting_mode: 'provider_cost';
	reason: 'wpcom_site_plan';
	eligible: true;
	preview: true;
	enforcement: 'site_allowance';
	blog_id: number;
	plan_tier?: CreditsPlanTier;
	credits_limit: number;
	credits_used: number;
	credits_remaining: number;
	/** Plan and top-up credits left together; absent from older snapshots. */
	credits_available?: number;
	/**
	 * The top-up fields come together, only on sites enrolled in top-ups.
	 * Purchased and remaining are null when purchases are unreadable.
	 */
	top_up_credits_purchased?: number | null;
	/** All-time usage: top-ups never reset. */
	top_up_credits_used?: number;
	top_up_credits_remaining?: number | null;
	exhausted: boolean;
	blocked: boolean;
	resets_at: string;
}

function isUtcTimestamp( value: unknown ): value is string {
	return (
		typeof value === 'string' &&
		/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|\+00:00)$/.test( value ) &&
		Number.isFinite( Date.parse( value ) ) &&
		new Date( value ).toISOString() === value.replace( /(?:Z|\+00:00)$/, '.000Z' )
	);
}

function isCreditAmount( value: unknown ): value is number {
	return typeof value === 'number' && Number.isSafeInteger( value ) && value >= 0;
}

/**
 * Keeps top-ups only when each field is readable and their balance adds up to the
 * combined balance. Anything else drops them, which hides their row but keeps the plan balance.
 */
function parseTopUps(
	snapshot: Record< string, unknown >,
	planRemaining: number,
	available: number
): Pick<
	CreditSnapshot,
	'top_up_credits_purchased' | 'top_up_credits_used' | 'top_up_credits_remaining'
> {
	const {
		top_up_credits_purchased: purchased,
		top_up_credits_used: used,
		top_up_credits_remaining: remaining,
	} = snapshot;
	if (
		! isCreditAmount( used ) ||
		( purchased !== null && ! isCreditAmount( purchased ) ) ||
		( remaining !== null &&
			( ! isCreditAmount( remaining ) || available !== planRemaining + remaining ) )
	) {
		return {};
	}
	return {
		top_up_credits_purchased: purchased,
		top_up_credits_used: used,
		top_up_credits_remaining: remaining,
	};
}

/** Missing or unreadable allowance metadata is unknown, never a zero balance. */
export function parseCreditSnapshot( value: unknown, siteId: number ): CreditSnapshot | undefined {
	if ( ! value || typeof value !== 'object' ) {
		return undefined;
	}
	const snapshot = value as Record< string, unknown >;
	const {
		credits_limit: limit,
		credits_used: used,
		credits_remaining: remaining,
		// An older snapshot has no combined balance, so its balance is the plan's.
		credits_available: available = remaining,
	} = snapshot;
	if (
		snapshot.schema_version !== 1 ||
		( snapshot.policy_id !== 'wpcom-site-monthly-v1' &&
			snapshot.policy_id !== 'wpcom-site-plan-period-v1' ) ||
		snapshot.cost_version !== 'provider-cost-v1' ||
		snapshot.accounting_mode !== 'provider_cost' ||
		snapshot.reason !== 'wpcom_site_plan' ||
		snapshot.eligible !== true ||
		snapshot.preview !== true ||
		snapshot.enforcement !== 'site_allowance' ||
		snapshot.blog_id !== siteId ||
		! [ limit, used, remaining, available ].every( isCreditAmount ) ||
		typeof limit !== 'number' ||
		limit <= 0 ||
		typeof used !== 'number' ||
		typeof remaining !== 'number' ||
		typeof available !== 'number' ||
		remaining !== Math.max( 0, limit - used ) ||
		available < remaining ||
		snapshot.exhausted !== ( available === 0 ) ||
		typeof snapshot.blocked !== 'boolean' ||
		( snapshot.blocked && ! snapshot.exhausted ) ||
		! isUtcTimestamp( snapshot.resets_at )
	) {
		return undefined;
	}
	const {
		plan_tier: planTier,
		top_up_credits_purchased,
		top_up_credits_used,
		top_up_credits_remaining,
		...balance
	} = snapshot;
	const isKnownTier =
		planTier === 'personal' ||
		planTier === 'premium' ||
		planTier === 'business' ||
		planTier === 'commerce';
	return {
		...balance,
		...( isKnownTier ? { plan_tier: planTier } : {} ),
		...parseTopUps( snapshot, remaining, available ),
	} as CreditSnapshot;
}

export function getLiveCreditSiteId(
	siteKey: string,
	config: UseAgentChatConfig
): number | undefined {
	const siteId = Number( siteKey );
	return config.agentId === ORCHESTRATOR_AGENT_ID &&
		config.agentUrl === ORCHESTRATOR_AGENT_URL &&
		Number.isSafeInteger( siteId ) &&
		siteId > 0
		? siteId
		: undefined;
}

export function buildLiveCreditsStatus( snapshot: CreditSnapshot ): CreditsStatus {
	const percent = ( 100 * snapshot.credits_remaining ) / snapshot.credits_limit;
	const { top_up_credits_purchased: topUpsPurchased, top_up_credits_remaining: topUpsRemaining } =
		snapshot;
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
	let resetDate: string;
	try {
		resetDate = new Date( snapshot.resets_at ).toLocaleDateString(
			getBrowserSafeLocale() ?? 'en',
			options
		);
	} catch {
		resetDate = new Date( snapshot.resets_at ).toLocaleDateString( 'en', options );
	}
	return {
		plan: 'paid',
		...( snapshot.plan_tier ? { planTier: snapshot.plan_tier } : {} ),
		percent,
		remaining: snapshot.credits_available ?? snapshot.credits_remaining,
		pools: [
			{
				id: 'plan',
				label: __( 'Monthly plan', __i18n_text_domain__ ),
				percent,
				remaining: snapshot.credits_remaining,
				total: snapshot.credits_limit,
				dateLabel: sprintf(
					/* translators: %s: the server-provided reset date, formatted in UTC. */
					__( 'Resets %s (UTC)', __i18n_text_domain__ ),
					resetDate
				),
			},
			// No row for a site that never bought top-ups, or whose purchases are unreadable.
			...( ( topUpsPurchased ?? 0 ) > 0 && typeof topUpsRemaining === 'number'
				? [
						{
							id: 'topups' as const,
							label: __( 'Top-ups', __i18n_text_domain__ ),
							remaining: topUpsRemaining,
						},
					]
				: [] ),
		],
	};
}

/** Bind the plans destination to the same site as the authenticated balance. */
export function getLiveCreditsUpgradeUrl(
	status: CreditsStatus,
	siteId: number | undefined,
	site?: AgentsManagerSite | null
): string | undefined {
	if (
		! siteId ||
		Number( site?.ID ) !== siteId ||
		! site?.domain.trim() ||
		[ '.', '..' ].includes( site.domain ) ||
		! [ 'personal', 'premium', 'business' ].includes( status.planTier ?? '' )
	) {
		return undefined;
	}
	return `https://wordpress.com/plans/${ encodeURIComponent( site.domain ) }`;
}
