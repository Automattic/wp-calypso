import { PLAN_BUSINESS, PLAN_PERSONAL } from '@automattic/calypso-products';
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
		expect( isPreselectablePlan( 'ecommerce-bundle' ) ).toBe( false );
	} );

	// The query is handed on whole, but the plan is the flow's to name, not the caller's.
	it( 'carries the query over and names the plan itself', () => {
		const url = target( 'business', { ref: 'pricing-lp', plan: 'value_bundle' }, 'es' );

		expect( url.pathname ).toBe( '/setup/onboarding/es' );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'pricing-lp' );
		expect( url.searchParams.get( 'plan' ) ).toBe( PLAN_BUSINESS );
	} );

	// The server route matcher is built from the map, so a flow outside it must fall through
	// to the legacy signup section rather than redirect.
	it( 'redirects only the flows it maps', () => {
		expect( shouldRedirectLegacyPlanFlow( 'business-monthly' ) ).toBe( true );
		expect( shouldRedirectLegacyPlanFlow( 'free' ) ).toBe( false );
	} );
} );
