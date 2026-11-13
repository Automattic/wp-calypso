import { getEmptyResponseCart } from '@automattic/shopping-cart';
import plans from './fixtures/plans.json';

/**
 * Answers wpcom API requests from fixtures, for the pricing grid stories.
 *
 * Prices come from fixtures/plans.json, a snapshot of the public /rest/v1.5/plans endpoint.
 * The site's current plan is set per story with setScenario().
 */

let scenario = { currentPlanSlug: 'free_plan' };
const unhandled = new Set();

export function setScenario( next ) {
	scenario = { currentPlanSlug: 'free_plan', ...next };
}

export function getUnhandledRequests() {
	return [ ...unhandled ];
}

// Tier order the API uses for available_for_upgrade / available_for_downgrade.
const TIERS = [
	'free_plan',
	'personal-bundle',
	'value_bundle',
	'business-bundle',
	'ecommerce-bundle',
];
const tierOf = ( slug ) => TIERS.findIndex( ( tier ) => slug === tier || slug.startsWith( tier ) );

function sitePlans() {
	const result = {};
	const current = plans.find( ( plan ) => plan.product_slug === scenario.currentPlanSlug );
	const currentTier = tierOf( scenario.currentPlanSlug );
	for ( const plan of plans ) {
		if ( plan.product_type !== 'bundle' && plan.product_slug !== 'free_plan' ) {
			continue;
		}
		const isCurrent = plan.product_slug === scenario.currentPlanSlug;
		const tier = tierOf( plan.product_slug );
		const longerTerm = tier === currentTier && plan.bill_period > ( current?.bill_period ?? 0 );
		result[ plan.product_id ] = {
			product_slug: plan.product_slug,
			raw_price: plan.raw_price,
			raw_price_integer: plan.raw_price_integer,
			formatted_price: plan.formatted_price,
			formatted_original_price: plan.formatted_price,
			raw_discount: 0,
			raw_discount_integer: 0,
			formatted_discount: '$0',
			discount_reason: null,
			is_domain_upgrade: null,
			currency_code: plan.currency_code,
			interval: plan.bill_period,
			current_plan: isCurrent,
			available_for_upgrade: tier >= 0 && ( tier > currentTier || longerTerm ),
			available_for_downgrade: tier >= 0 && tier < currentTier,
			has_domain_credit: false,
			id: isCurrent ? 1 : null,
			user_is_owner: isCurrent ? true : null,
			...( isCurrent && plan.product_slug !== 'free_plan'
				? { subscribed_date: '2026-01-01', expiry: '2027-01-01' }
				: {} ),
		};
	}
	return result;
}

function route( params ) {
	const path = ( params.path || '' ).replace( /^\/+/, '/' );
	if ( typeof window !== 'undefined' ) {
		window.__pgRequests = [
			...( window.__pgRequests ?? [] ),
			`${ params.method || 'GET' } ${ path }`,
		];
		if ( path === '/js-error' ) {
			window.__pgJsErrors = [
				...( window.__pgJsErrors ?? [] ),
				JSON.stringify( params.body ?? params.formData ?? params ).slice( 0, 800 ),
			];
		}
	}

	if ( path === '/plans' ) {
		return plans;
	}
	if ( /^\/sites\/[^/]+\/plans$/.test( path ) ) {
		return sitePlans();
	}
	if ( /^\/sites\/[^/]+\/purchases$/.test( path ) || /^\/me\/purchases/.test( path ) ) {
		return [];
	}
	if ( /^\/me\/shopping-cart\//.test( path ) ) {
		return { ...getEmptyResponseCart(), cart_key: path.split( '/' ).pop(), currency: 'USD' };
	}
	if ( /^\/products/.test( path ) ) {
		return {};
	}
	if ( /^\/sites\/[^/]+\/site-intent$/.test( path ) ) {
		return { site_intent: scenario.siteIntent ?? '' };
	}

	if ( /^\/experiments\/[^/]+\/assignments\//.test( path ) ) {
		// ExPlat: one variation per requested experiment; unlisted experiments get control (null).
		const query = new URLSearchParams(
			typeof params.query === 'string' ? params.query : ( params.query ?? {} )
		);
		const name = query.get( 'experiment_name' );
		return {
			variations: { ...( name ? { [ name ]: null } : {} ), ...( scenario.experiments ?? {} ) },
			ttl: 3600,
		};
	}

	unhandled.add( `${ params.method || 'GET' } ${ path }` );
	return {};
}

export default function request( params, fn ) {
	const body = route( params );
	if ( typeof fn === 'function' ) {
		setTimeout( () => fn( null, body, {} ), 0 );
		return { abort() {} };
	}
	return Promise.resolve( body );
}

export function canAccessWpcomApis() {
	return true;
}

export function isCookieAuthMissing() {
	return false;
}

export function reloadProxy() {}

export function requestAllBlogsAccess() {}
