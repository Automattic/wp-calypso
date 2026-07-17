/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import planUpgradeFlow from '../plan-upgrade';

let mockQuery: Record< string, string > = {};

jest.mock( '@automattic/onboarding', () => ( { PLAN_UPGRADE_FLOW: 'plan-upgrade' } ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { SITE_STORE: 'SITE_STORE' } ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( { get: ( key: string ) => mockQuery[ key ] ?? null } ),
} ) );

const mockClearSignupDestination = jest.fn();
jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupDestinationCookie: () => mockClearSignupDestination(),
} ) );

const submitPlan = ( plan: string ) =>
	planUpgradeFlow.useStepNavigation( STEPS.UNIFIED_PLANS.slug, jest.fn() ).submit( {
		slug: STEPS.UNIFIED_PLANS.slug,
		providedDependencies: { stepName: 'plans', cartItems: [ { product_slug: plan } ] },
	} );

const checkoutUrl = () => ( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ];

describe( 'plan-upgrade flow', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockQuery = { siteSlug: 'example.wordpress.com' };
		Object.defineProperty( window, 'location', {
			value: { ...window.location, assign: jest.fn() },
			writable: true,
		} );
	} );

	it( 'checks out the products it was given alongside the plan', () => {
		mockQuery.products = 'sensei_pro_monthly';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).toContain(
			'/checkout/example.wordpress.com/personal-bundle,sensei_pro_monthly?'
		);
	} );

	it( 'hands checkout a slug with a slash in the encoding it reads back', () => {
		// The router won't take a percent-encoded slash, so checkout has an encoding of its own.
		mockQuery.products = 'no-adverts/no-adverts.php';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).toContain(
			'/checkout/example.wordpress.com/personal-bundle,no-adverts%25no-adverts.php?'
		);
	} );

	it( 'leaves the destination to checkout when a product is in the cart', () => {
		mockQuery.products = 'sensei_pro_monthly';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).not.toContain( 'redirect_to' );
	} );

	it( 'keeps checkout from offering an upsell that would swallow the cart destination', () => {
		mockQuery.products = 'sensei_pro_monthly';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).toContain( 'upgrade=1' );
	} );

	it( 'lets checkout make its offer when it has a destination to come back to', () => {
		mockQuery.redirect_to = '/plugins/givewp/example.wordpress.com';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).not.toContain( 'upgrade=1' );
	} );

	it( 'drops a recent signup destination, which checkout would take over the cart', () => {
		// Checkout reads the cookie before the cart.
		mockQuery.products = 'sensei_pro_monthly';

		submitPlan( 'personal-bundle' );

		expect( mockClearSignupDestination ).toHaveBeenCalled();
	} );

	it( 'keeps the signup destination when the caller named a destination of its own', () => {
		mockQuery.redirect_to = '/plugins/givewp/example.wordpress.com';

		submitPlan( 'personal-bundle' );

		expect( mockClearSignupDestination ).not.toHaveBeenCalled();
	} );

	it( 'sends a plan-only purchase where the caller asked', () => {
		mockQuery.redirect_to = '/plugins/givewp/example.wordpress.com';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).toContain(
			`redirect_to=${ encodeURIComponent( '/plugins/givewp/example.wordpress.com' ) }`
		);
	} );

	it( 'falls back to the sites dashboard when the caller asks for nowhere', () => {
		mockQuery.redirect_to = '';

		submitPlan( 'personal-bundle' );

		expect( checkoutUrl() ).toContain( 'redirect_to=' );
	} );
} );
