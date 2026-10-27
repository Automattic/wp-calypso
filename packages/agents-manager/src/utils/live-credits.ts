import { __, sprintf } from '@wordpress/i18n';
import { getBrowserSafeLocale } from 'i18n-calypso';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import { getActiveSessionId } from './agent-session';
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

/** The meter's status for a valid allowance snapshot, so other chats can show the same balance. */
export function parseLiveCreditsStatus(
	value: unknown,
	siteId: number
): CreditsStatus | undefined {
	const snapshot = parseCreditSnapshot( value, siteId );
	return snapshot && buildLiveCreditsStatus( snapshot );
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

/** Tags purchases from the credits prompts. Checkout copies it onto the purchase, and Tracks events send it as `ref`. */
export const CREDITS_UPGRADE_SOURCE = 'wp_ai_credits';

/** The store's AI credits product. Kept here because this package doesn't depend on `@automattic/api-core`. */
const CREDITS_TOP_UP_PRODUCT = 'ai-credits-lifetime';

/** Credits one Add credits click buys: one pack, with no amount picker. */
const CREDITS_TOP_UP_AMOUNT = 100000;

/** A plan upgrade, or a credits pack. Tracks events send it as `cta_type`. */
export type CreditsPurchaseKind = 'upgrade' | 'top_up';

export interface CreditsPurchaseLink {
	kind: CreditsPurchaseKind;
	url: string;
}

// Upgrading is the better deal on the lower plans. Business and Commerce buy a
// credits pack instead, and Commerce has no plan to upgrade to.
const CREDITS_PURCHASE_KIND_BY_TIER: Record< CreditsPlanTier, CreditsPurchaseKind > = {
	personal: 'upgrade',
	premium: 'upgrade',
	business: 'top_up',
	commerce: 'top_up',
};

// Copied from `getWPComRedirectToURL` in Jetpack's projects/js-packages/ai-client/src/hooks/use-ai-checkout/index.ts.
function getCreditsReturnUrl( siteFragment: string, isSimpleSite: boolean ): string {
	const postId = new URLSearchParams( window.location.search ).get( 'post' );
	if ( isSimpleSite && postId !== null ) {
		return `https://wordpress.com/post/${ siteFragment }/${ encodeURIComponent( postId ) }`;
	}
	return `https://wordpress.com/home/${ siteFragment }`;
}

/** An empty ID, or the Tracks standard's `none` for a missing one, names no session. */
function getAiSessionQuery( aiSessionId?: string ): { ai_session_id?: string } {
	return aiSessionId && aiSessionId !== 'none' ? { ai_session_id: aiSessionId } : {};
}

/**
 * The plans page or the credits pack checkout, by the site's plan. Calypso's
 * plans and checkout routes take the site's domain or its ID. Add credits returns to
 * the post open in a Simple site's editor, or else the site's home. Pass the
 * `ai_session_id` the chat's click event sends, so checkout can save it on the purchase.
 */
export function getCreditsPurchaseLink(
	status: CreditsStatus,
	site: string | number,
	isSimpleSite: boolean,
	aiSessionId?: string
): CreditsPurchaseLink | undefined {
	const kind = status.planTier && CREDITS_PURCHASE_KIND_BY_TIER[ status.planTier ];
	if ( ! kind ) {
		return undefined;
	}

	const siteFragment = encodeURIComponent( site );
	const attribution = { source: CREDITS_UPGRADE_SOURCE, ...getAiSessionQuery( aiSessionId ) };
	if ( kind === 'upgrade' ) {
		// No return address: the plans page passes `redirect_to` on to checkout, which then
		// skips its own pages after a plan purchase. Only the plans page's downgrade and
		// renewal buttons read `cancel_to`.
		const query = new URLSearchParams( attribution );
		return { kind, url: `https://wordpress.com/plans/${ siteFragment }?${ query }` };
	}

	const returnUrl = getCreditsReturnUrl( siteFragment, isSimpleSite );
	const query = new URLSearchParams( {
		...attribution,
		redirect_to: returnUrl,
		cancel_to: returnUrl,
	} );
	return {
		kind,
		url: `https://wordpress.com/checkout/${ siteFragment }/${ CREDITS_TOP_UP_PRODUCT }:-q-${ CREDITS_TOP_UP_AMOUNT }?${ query }`,
	};
}

/**
 * Bind the purchase destination to the same site as the authenticated balance, and
 * to the session the credits Tracks events send as `ai_session_id`.
 */
export function getLiveCreditsPurchaseLink(
	status: CreditsStatus,
	siteId: number | undefined,
	site?: AgentsManagerSite | null
): CreditsPurchaseLink | undefined {
	if (
		! siteId ||
		Number( site?.ID ) !== siteId ||
		! site?.domain.trim() ||
		[ '.', '..' ].includes( site.domain )
	) {
		return undefined;
	}
	return getCreditsPurchaseLink(
		status,
		site.domain,
		window._currentSiteType === 'simple',
		getActiveSessionId()
	);
}
