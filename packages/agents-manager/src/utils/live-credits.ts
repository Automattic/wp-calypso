import { __, sprintf } from '@wordpress/i18n';
import { getBrowserSafeLocale } from 'i18n-calypso';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../constants';
import type { CreditsPlanTier, CreditsStatus } from './credits';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

/** The opted-in allowance draft's terminal result.ai_credits contract. */
export interface CreditSnapshot {
	schema_version: 1;
	policy_id: 'wpcom-site-monthly-v1';
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

/** Missing or unreadable allowance metadata is unknown, never a zero balance. */
export function parseCreditSnapshot( value: unknown, siteId: number ): CreditSnapshot | undefined {
	if ( ! value || typeof value !== 'object' ) {
		return undefined;
	}
	const snapshot = value as Record< string, unknown >;
	const { credits_limit: limit, credits_used: used, credits_remaining: remaining } = snapshot;
	if (
		snapshot.schema_version !== 1 ||
		snapshot.policy_id !== 'wpcom-site-monthly-v1' ||
		snapshot.cost_version !== 'provider-cost-v1' ||
		snapshot.accounting_mode !== 'provider_cost' ||
		snapshot.reason !== 'wpcom_site_plan' ||
		snapshot.eligible !== true ||
		snapshot.preview !== true ||
		snapshot.enforcement !== 'site_allowance' ||
		snapshot.blog_id !== siteId ||
		! [ limit, used, remaining ].every(
			( amount ) => typeof amount === 'number' && Number.isSafeInteger( amount ) && amount >= 0
		) ||
		typeof limit !== 'number' ||
		limit <= 0 ||
		typeof used !== 'number' ||
		typeof remaining !== 'number' ||
		remaining !== Math.max( 0, limit - used ) ||
		snapshot.exhausted !== ( remaining === 0 ) ||
		typeof snapshot.blocked !== 'boolean' ||
		( snapshot.blocked && ! snapshot.exhausted ) ||
		! isUtcTimestamp( snapshot.resets_at )
	) {
		return undefined;
	}
	const { plan_tier: planTier, ...balance } = snapshot;
	const isKnownTier =
		planTier === 'personal' ||
		planTier === 'premium' ||
		planTier === 'business' ||
		planTier === 'commerce';
	return { ...balance, ...( isKnownTier ? { plan_tier: planTier } : {} ) } as CreditSnapshot;
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
		remaining: snapshot.credits_remaining,
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
		],
	};
}
