import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_PREMIUM_MONTHLY,
} from '@automattic/calypso-products';

/**
 * The legacy `/start/<plan>` signup flows, which exist only to preselect a plan, and the
 * data needed to serve them from Stepper's onboarding flow instead.
 */

/** Flow name as it appears in the wild, mapped to the plan it preselects. */
export const REDIRECTED_PLAN_FLOWS = {
	personal: PLAN_PERSONAL,
	'personal-monthly': PLAN_PERSONAL_MONTHLY,
	'personal-2y': PLAN_PERSONAL_2_YEARS,
	'personal-3y': PLAN_PERSONAL_3_YEARS,
	premium: PLAN_PREMIUM,
	'premium-monthly': PLAN_PREMIUM_MONTHLY,
	'premium-2y': PLAN_PREMIUM_2_YEARS,
	'premium-3y': PLAN_PREMIUM_3_YEARS,
	business: PLAN_BUSINESS,
	'business-monthly': PLAN_BUSINESS_MONTHLY,
	'business-2y': PLAN_BUSINESS_2_YEARS,
	'business-3y': PLAN_BUSINESS_3_YEARS,

	// Landpack emits these spellings. They never matched a flow name, so they lose their
	// preselection today; mapping them fixes the pages already cached.
	'personal-2-years': PLAN_PERSONAL_2_YEARS,
	'personal-3-years': PLAN_PERSONAL_3_YEARS,
	'premium-2-years': PLAN_PREMIUM_2_YEARS,
	'premium-3-years': PLAN_PREMIUM_3_YEARS,
	'business-2-years': PLAN_BUSINESS_2_YEARS,
	'business-3-years': PLAN_BUSINESS_3_YEARS,
} as const;

export type RedirectedPlanFlow = keyof typeof REDIRECTED_PLAN_FLOWS;
export type PreselectablePlan = ( typeof REDIRECTED_PLAN_FLOWS )[ RedirectedPlanFlow ];

// Plans onboarding will preselect on request. Today exactly what the redirected flows sold;
// widening it is a deliberate act, because anything here is selectable by typing a URL.
const PRESELECTABLE_PLANS: ReadonlySet< string > = new Set(
	Object.values( REDIRECTED_PLAN_FLOWS )
);

/**
 * Whether onboarding will preselect a plan on request.
 *
 * Deliberately narrower than "is a WordPress.com plan": a plan reached through its own
 * eligibility gate — the Student plan behind the Education flow's invite check, or an
 * ecommerce plan whose flow arranges an Atomic transfer — must not become selectable by
 * hand-writing a query argument. The backend remains the authority; this only decides what
 * onboarding is willing to preselect.
 */
export function isPreselectablePlan( slug: string ): slug is PreselectablePlan {
	return PRESELECTABLE_PLANS.has( slug );
}

/**
 * Whether a plan can buy a storage add-on. Annual Business and annual Commerce are the two
 * that can; the plans grid holds the canonical list, and only Business is redirected here.
 */
export function supportsStorageAddOn( slug: string ): boolean {
	return slug === REDIRECTED_PLAN_FLOWS.business;
}

/** Whether a flow should be redirected at all. */
export function shouldRedirectLegacyPlanFlow( flow: string ): flow is RedirectedPlanFlow {
	return flow in REDIRECTED_PLAN_FLOWS;
}

/**
 * The Stepper URL a legacy plan flow redirects to.
 * The whole query is carried over. Nothing here is a boundary: `plan` and `storage` are
 * checked where they are read, which is also the only place that covers someone typing
 * `/setup/onboarding` directly, and the rest of onboarding's arguments are reachable there
 * anyway.
 * @param flow     Flow name from the path.
 * @param query    Parsed query string of the incoming request.
 * @param locale   Locale slug to append, when it isn't the default.
 */
export function getLegacyPlanFlowRedirect(
	flow: RedirectedPlanFlow,
	query: Record< string, unknown > = {},
	locale = ''
): string {
	const forwarded: Record< string, string > = {};

	for ( const [ arg, value ] of Object.entries( query ) ) {
		if ( typeof value === 'string' && value ) {
			forwarded[ arg ] = value;
		}
	}

	// Last, so a caller cannot name its own plan through a flow that already names one.
	forwarded.plan = REDIRECTED_PLAN_FLOWS[ flow ];

	const search = new URLSearchParams( forwarded ).toString();

	return `/setup/onboarding${ locale ? `/${ locale }` : '' }?${ search }`;
}
