import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	isFreeHostingTrial,
} from '@automattic/calypso-products';

const INTEGRATION_REGEX = /^[a-z0-9-]{1,32}$/i;
const CONTEXT_ID_REGEX = /^[a-z0-9-]{1,64}$/i;
const TITLE_MAX = 80;

const ATOMIC_TRIGGERING_PLANS = new Set( [
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
] );

export interface DirectToCartParams {
	plan: string | null;
	invalidPlan: boolean;
	redirectTo: string | null;
	integration: string | null;
	contextId: string | null;
	title: string | null;
	coupon: string | null;
	ref: string | null;
	/** Names of params that failed validation; emit Tracks events for these. */
	invalidParams: string[];
}

function isAtomicTriggeringPlan( slug: string ): boolean {
	return ATOMIC_TRIGGERING_PLANS.has( slug ) || isFreeHostingTrial( slug );
}

function passes( regex: RegExp, value: string | null ): boolean {
	return Boolean( value && regex.test( value ) );
}

export function validateParams( query: URLSearchParams ): DirectToCartParams {
	const invalidParams: string[] = [];

	const planRaw = query.get( 'plan' );
	const invalidPlan = ! planRaw || ! isAtomicTriggeringPlan( planRaw );

	const integrationRaw = query.get( 'integration' );
	const integration = passes( INTEGRATION_REGEX, integrationRaw ) ? integrationRaw : null;
	if ( integrationRaw && ! integration ) {
		invalidParams.push( 'integration' );
	}

	const contextIdRaw = query.get( 'context_id' );
	const contextId = passes( CONTEXT_ID_REGEX, contextIdRaw ) ? contextIdRaw : null;
	if ( contextIdRaw && ! contextId ) {
		invalidParams.push( 'context_id' );
	}

	const titleRaw = query.get( 'title' );
	const trimmedTitle = titleRaw?.trim() ?? '';
	const title = trimmedTitle.length > 0 ? trimmedTitle.slice( 0, TITLE_MAX ) : null;

	return {
		plan: planRaw || null,
		invalidPlan,
		redirectTo: query.get( 'redirect_to' ),
		integration,
		contextId,
		title,
		coupon: query.get( 'coupon' ),
		ref: query.get( 'ref' ),
		invalidParams,
	};
}
