/**
 * @jest-environment jsdom
 */
import { addProductsToCart } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import wpcom from 'calypso/lib/wp';
import domainAndPlan from '../domain-and-plan';
import type { BaseNavigationControls } from '../../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const mockSetDomainCartItem = jest.fn();
const mockSetDomainCartItems = jest.fn();
const mockGetDomainCartItem = jest.fn( (): MinimalRequestCartProduct | null => null );
const mockGetDomainCartItems = jest.fn( (): MinimalRequestCartProduct[] => [] );
const mockGetSignupDomainOrigin = jest.fn( (): string | undefined => undefined );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setDomainCartItem: mockSetDomainCartItem,
		setDomainCartItems: mockSetDomainCartItems,
		setSignupDomainOrigin: jest.fn(),
	} ),
	useSelect: ( selector: ( select: () => unknown ) => unknown ) =>
		selector( () => ( {
			getDomainCartItem: mockGetDomainCartItem,
			getDomainCartItems: mockGetDomainCartItems,
			getSignupDomainOrigin: mockGetSignupDomainOrigin,
		} ) ),
} ) );

jest.mock( '@automattic/launchpad', () => ( {
	updateLaunchpadSettings: jest.fn(),
	useLaunchpad: () => ( { data: {} } ),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	DOMAIN_AND_PLAN_FLOW: 'domain-and-plan',
	addProductsToCart: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/signup', () => ( {
	SIGNUP_DOMAIN_ORIGIN: { USE_YOUR_DOMAIN: 'use-your-domain' },
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: { post: jest.fn( () => Promise.resolve( {} ) ) },
} ) );

let mockQueryArgs = '';

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( mockQueryArgs ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug', () => ( {
	useSiteSlug: () => 'example.wordpress.com',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
} ) );

const PAID_ANNUAL_SITE = {
	ID: 123,
	plan: {
		product_slug: 'value_bundle',
		is_free: false,
		billing_period: 'Annually',
		features: { active: [ 'domain-mapping' ] },
	},
};

const FREE_SITE = {
	ID: 123,
	plan: {
		product_slug: 'free_plan',
		is_free: true,
		billing_period: '',
		features: { active: [] },
	},
};

const REGISTRATION_CART_ITEM = { product_slug: 'dotcom_domain', meta: 'example.com' };
const MAPPING_CART_ITEM = { product_slug: 'domain_map', meta: 'example.com' };
const TRANSFER_CART_ITEM = { product_slug: 'domain_transfer', meta: 'example.com' };
const PAID_MONTHLY_SITE = {
	ID: 123,
	plan: {
		product_slug: 'value_bundle_monthly',
		is_free: false,
		billing_period: 'Monthly',
		features: { active: [ 'domain-mapping' ] },
	},
};

// `features` is required by the type but can be absent in real API responses.
const SITE_WITHOUT_PLAN_FEATURES = {
	ID: 123,
	plan: { product_slug: 'free_plan', is_free: true, billing_period: '' },
};

const PLAN_CART_ITEM = { product_slug: 'value_bundle' };

type StepSlug = Parameters< typeof domainAndPlan.useStepNavigation >[ 0 ];
type SubmittedStep = Parameters<
	ReturnType< typeof domainAndPlan.useStepNavigation >[ 'submit' ]
>[ 0 ];

const submitStep = async ( step: string, providedDependencies: Record< string, unknown > = {} ) => {
	const navigate = jest.fn();
	const { result } = renderHook( () =>
		domainAndPlan.useStepNavigation( step as StepSlug, navigate )
	);

	await result.current.submit( { slug: step, providedDependencies } as SubmittedStep );

	return { navigate };
};

const submitUseMyDomain = ( providedDependencies: Record< string, unknown > ) =>
	submitStep( 'use-my-domain', providedDependencies );

/**
 * `submittedDomains` is a ref on the hook instance, so the submit and the later
 * goBack have to share one render to observe it.
 */
const submitUseMyDomainThenGoBack = async ( providedDependencies: Record< string, unknown > ) => {
	const navigate = jest.fn();
	let currentStep = 'use-my-domain';

	const { result, rerender } = renderHook(
		() =>
			domainAndPlan.useStepNavigation( currentStep as StepSlug, navigate ) as ReturnType<
				typeof domainAndPlan.useStepNavigation
			> &
				BaseNavigationControls
	);

	await result.current.submit( {
		slug: 'use-my-domain',
		providedDependencies,
	} as SubmittedStep );

	currentStep = 'plans';
	rerender();
	result.current.goBack?.();

	return { goBackFromPlans: navigate };
};

describe( 'domain-and-plan flow use-my-domain navigation', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'https://wordpress.com/setup/domain-and-plan/use-my-domain',
				origin: 'https://wordpress.com',
			},
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryArgs = '';
		mockGetDomainCartItems.mockReturnValue( [] );
	} );

	it( 'connects the domain directly and lands on the connection setup page when mapping is included in the plan', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		const { navigate } = await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( wpcom.req.post ).toHaveBeenCalledWith( '/sites/123/add-domain-mapping', {
			domain: 'example.com',
		} );
		expect( window.location.replace ).toHaveBeenCalledWith(
			'/domains/mapping/example.wordpress.com/setup/example.com?firstVisit=true'
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'lands on the connection setup page when the step already created the mapping after ownership verification', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		await submitUseMyDomain( { ownershipVerificationCompleted: true, domain: 'example.com' } );

		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( window.location.replace ).toHaveBeenCalledWith(
			'/domains/mapping/example.wordpress.com/setup/example.com?firstVisit=true'
		);
	} );

	it( 'stores the domain and goes to the plans step when the site has no qualifying plan', async () => {
		( useSite as jest.Mock ).mockReturnValue( FREE_SITE );

		const { navigate } = await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( mockSetDomainCartItem ).toHaveBeenCalledWith( MAPPING_CART_ITEM );
		expect( mockSetDomainCartItems ).toHaveBeenCalledWith( [ MAPPING_CART_ITEM ] );
		expect( navigate ).toHaveBeenCalledWith( 'plans' );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'adds a domain transfer to the cart before redirecting to checkout', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );
		mockGetDomainCartItems.mockReturnValue( [ TRANSFER_CART_ITEM ] );

		await submitUseMyDomain( { domainCartItem: TRANSFER_CART_ITEM } );

		expect( mockSetDomainCartItem ).toHaveBeenCalledWith( TRANSFER_CART_ITEM );
		expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'domain-and-plan', [
			TRANSFER_CART_ITEM,
		] );
		expect( window.location.assign ).toHaveBeenCalledWith(
			`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
				'/home/example.wordpress.com'
			) }`
		);
	} );

	it( 'goes to the plans step when the user must buy a plan before connecting', async () => {
		( useSite as jest.Mock ).mockReturnValue( FREE_SITE );

		const { navigate } = await submitUseMyDomain( { skipToPlan: true } );

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'sends a paying customer to checkout, not the plans step, when the mapping request fails', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_MONTHLY_SITE );
		( wpcom.req.post as jest.Mock ).mockRejectedValueOnce( new Error( 'nope' ) );
		mockGetDomainCartItems.mockReturnValue( [ MAPPING_CART_ITEM ] );

		const { navigate } = await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( navigate ).not.toHaveBeenCalled();
		expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'domain-and-plan', [
			MAPPING_CART_ITEM,
		] );
		expect( window.location.assign ).toHaveBeenCalledWith(
			expect.stringContaining( '/checkout/example.wordpress.com' )
		);
	} );

	it( 'keeps the plans-step back button pointed at domain search after skipping to plans', async () => {
		( useSite as jest.Mock ).mockReturnValue( FREE_SITE );

		const { goBackFromPlans } = await submitUseMyDomainThenGoBack( { skipToPlan: true } );

		expect( goBackFromPlans ).toHaveBeenCalledWith( 'domains' );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'does not throw when the plan is missing its features list', async () => {
		( useSite as jest.Mock ).mockReturnValue( SITE_WITHOUT_PLAN_FEATURES );

		const { navigate } = await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
	} );

	it.each( [
		[ 'off-site URL', 'https://evil.example/%s' ],
		[ 'origin-extension host', 'https://my.wordpress.com.evil.example/%s' ],
		[ 'userinfo trick', 'https://my.wordpress.com@evil.example/%s' ],
		[ 'backslash protocol-relative', '/\\evil.example/%s' ],
	] )( 'ignores a malicious connection setup URL (%s)', async ( _label, template ) => {
		mockQueryArgs = `domainConnectionSetupUrl=${ encodeURIComponent( template ) }`;
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/domains/mapping/example.wordpress.com/setup/example.com?firstVisit=true'
		);
	} );

	it( 'uses the connection setup URL supplied by the entry point when there is one', async () => {
		mockQueryArgs =
			'domainConnectionSetupUrl=https%3A%2F%2Fmy.wordpress.com%2Fdomains%2F%25s%2Fdomain-connection-setup';
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://my.wordpress.com/domains/example.com/domain-connection-setup'
		);
	} );
} );

describe( 'domain-and-plan flow post-checkout destination', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'https://wordpress.com/setup/domain-and-plan/plans',
				origin: 'https://wordpress.com',
			},
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryArgs = '';
		( useSite as jest.Mock ).mockReturnValue( FREE_SITE );
		mockGetDomainCartItems.mockReturnValue( [] );
	} );

	it( 'finishes on the connection setup page after the plan that unlocks the connection is paid for', async () => {
		mockGetDomainCartItems.mockReturnValue( [ MAPPING_CART_ITEM ] );

		await submitStep( 'plans', { cartItems: [ PLAN_CART_ITEM ] } );

		expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'domain-and-plan', [
			PLAN_CART_ITEM,
			MAPPING_CART_ITEM,
		] );
		expect( window.location.assign ).toHaveBeenCalledWith(
			`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
				'/domains/mapping/example.wordpress.com/setup/example.com?firstVisit=true'
			) }`
		);
	} );

	it( 'keeps the default destination when the cart holds more than one domain', async () => {
		mockGetDomainCartItems.mockReturnValue( [
			MAPPING_CART_ITEM,
			{ product_slug: 'domain_map', meta: 'second.com' },
		] );

		await submitStep( 'plans', { cartItems: [ PLAN_CART_ITEM ] } );

		expect( window.location.assign ).toHaveBeenCalledWith(
			`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
				'/home/example.wordpress.com'
			) }`
		);
	} );

	it( 'keeps the default destination when no domain is being connected', async () => {
		await submitStep( 'plans', { cartItems: [ PLAN_CART_ITEM ] } );

		expect( window.location.assign ).toHaveBeenCalledWith(
			`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
				'/home/example.wordpress.com'
			) }`
		);
	} );

	it( 'buys just the domain when the user keeps the free plan', async () => {
		mockGetDomainCartItems.mockReturnValue( [ REGISTRATION_CART_ITEM ] );

		await submitStep( 'plans', { cartItems: null } );

		expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'domain-and-plan', [
			REGISTRATION_CART_ITEM,
		] );
		expect( window.location.assign ).toHaveBeenCalledWith(
			`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
				'/home/example.wordpress.com'
			) }`
		);
	} );

	it( 'returns to the site instead of opening an empty checkout', async () => {
		mockQueryArgs = 'back_to=/domains/manage/example.wordpress.com';

		await submitStep( 'plans', { cartItems: null } );

		expect( addProductsToCart ).not.toHaveBeenCalled();
		expect( window.location.assign ).toHaveBeenCalledWith(
			'/domains/manage/example.wordpress.com'
		);
	} );
} );

describe( 'domain-and-plan flow plans step copy', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetDomainCartItem.mockReturnValue( null );
		mockGetSignupDomainOrigin.mockReturnValue( undefined );
	} );

	const renderPlansProps = () => {
		const { result } = renderHook( () => domainAndPlan.useStepsProps?.() );

		return result.current?.plans;
	};

	it( 'promotes the free first year for a domain the user is registering', () => {
		mockGetDomainCartItem.mockReturnValue( REGISTRATION_CART_ITEM );
		mockGetSignupDomainOrigin.mockReturnValue( 'custom' );

		expect( renderPlansProps() ).toMatchObject( {
			headerText: 'Your domain name is ready',
			hideFreePlan: true,
		} );
		expect( renderPlansProps()?.subHeaderText ).toBeDefined();
	} );

	it( 'does not promise a free year for a domain the user already owns', () => {
		mockGetDomainCartItem.mockReturnValue( MAPPING_CART_ITEM );
		mockGetSignupDomainOrigin.mockReturnValue( 'use-your-domain' );

		expect( renderPlansProps() ).toMatchObject( {
			headerText: 'Choose the perfect plan',
			subHeaderText: undefined,
		} );
	} );

	it( 'asks for a plan when no domain was picked', () => {
		expect( renderPlansProps() ).toMatchObject( {
			headerText: 'Choose the perfect plan',
			subHeaderText: undefined,
		} );
	} );
} );
