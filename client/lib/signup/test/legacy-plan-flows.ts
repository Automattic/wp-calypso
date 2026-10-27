import { PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_PERSONAL } from '@automattic/calypso-products';
import {
	getLegacyPlanFlowRedirect,
	isPreselectablePlan,
	shouldRedirectLegacyPlanFlow,
} from '../legacy-plan-flows';

const target = ( ...args: Parameters< typeof getLegacyPlanFlowRedirect > ) =>
	new URL( getLegacyPlanFlowRedirect( ...args ), 'https://wordpress.com' );

describe( 'legacy plan flows', () => {
	// The allowlist is what stops a hand-written `?plan=` reaching a plan with its own
	// eligibility gate, such as the Student plan behind the Education flow's invite check.
	it( 'preselects only the plans that need no further gate', () => {
		expect( isPreselectablePlan( PLAN_PERSONAL ) ).toBe( true );
		expect( isPreselectablePlan( 'wp_bundle_student_yearly' ) ).toBe( false );
		expect( isPreselectablePlan( PLAN_ECOMMERCE ) ).toBe( true );
	} );

	// The query is handed on whole, but the plan is the flow's to name, not the caller's.
	it( 'carries the query over and names the plan itself', () => {
		const url = target( 'business', { ref: 'pricing-lp', plan: 'value_bundle' }, 'es' );

		expect( url.pathname ).toBe( '/setup/onboarding/es' );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'pricing-lp' );
		expect( url.searchParams.get( 'plan' ) ).toBe( PLAN_BUSINESS );
	} );

	// WordCamp coupon links land here; the coupon has to reach checkout, and no plan is implied.
	it( 'sends plans-first to plain onboarding with its coupon', () => {
		const url = target( 'plans-first', { coupon: 'WC_ABC', utm_source: 'wordcamp' } );

		expect( url.pathname ).toBe( '/setup/onboarding' );
		expect( url.searchParams.get( 'coupon' ) ).toBe( 'WC_ABC' );
		expect( url.searchParams.get( 'utm_source' ) ).toBe( 'wordcamp' );
		expect( url.searchParams.has( 'plan' ) ).toBe( false );
	} );

	it( 'sends import to onboarding marked to end in site migration', () => {
		const url = target( 'import', { ref: 'import-lp' } );

		expect( url.pathname ).toBe( '/setup/onboarding' );
		expect( url.searchParams.get( 'import' ) ).toBe( '1' );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'import-lp' );
		expect( url.searchParams.has( 'plan' ) ).toBe( false );
	} );

	// The server route matcher is built from the map, so a flow outside it must fall through
	// to the legacy signup section rather than redirect.
	it( 'redirects only the flows it maps', () => {
		expect( shouldRedirectLegacyPlanFlow( 'business-monthly' ) ).toBe( true );
		expect( shouldRedirectLegacyPlanFlow( 'plans-first' ) ).toBe( true );
		expect( shouldRedirectLegacyPlanFlow( 'free' ) ).toBe( false );
	} );
} );
