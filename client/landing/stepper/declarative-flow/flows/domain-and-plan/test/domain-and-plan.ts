/**
 * @jest-environment jsdom
 */
import { addProductsToCart } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import wpcom from 'calypso/lib/wp';
import domainAndPlan from '../domain-and-plan';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const mockSetDomainCartItem = jest.fn();
const mockSetDomainCartItems = jest.fn();
const mockGetDomainCartItems = jest.fn( (): MinimalRequestCartProduct[] => [] );
const mockGetPlanCartItem = jest.fn( () => null );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setDomainCartItem: mockSetDomainCartItem,
		setDomainCartItems: mockSetDomainCartItems,
		setSignupDomainOrigin: jest.fn(),
		setHideFreePlan: jest.fn(),
	} ),
	useSelect: () => ( {
		getDomainCartItems: mockGetDomainCartItems,
		getPlanCartItem: mockGetPlanCartItem,
	} ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
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

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( '' ),
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

const MAPPING_CART_ITEM = { product_slug: 'domain_map', meta: 'example.com' };
const TRANSFER_CART_ITEM = { product_slug: 'domain_transfer', meta: 'example.com' };

describe( 'domain-and-plan flow use-my-domain navigation', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				href: 'https://wordpress.com/setup/domain-and-plan/use-my-domain',
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
		mockGetDomainCartItems.mockReturnValue( [] );
		mockGetPlanCartItem.mockReturnValue( null );
	} );

	const submitUseMyDomain = async ( providedDependencies: Record< string, unknown > ) => {
		const navigate = jest.fn();
		const { result } = renderHook( () =>
			// `useStepNavigation` reads `this.name`, so it must be invoked bound to the flow.
			domainAndPlan.useStepNavigation.call(
				domainAndPlan,
				'use-my-domain' as Parameters< typeof domainAndPlan.useStepNavigation >[ 0 ],
				navigate
			)
		);

		await result.current.submit?.( providedDependencies );

		return { navigate };
	};

	it( 'connects the domain directly and lands on the connection setup page when mapping is included in the plan', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		const { navigate } = await submitUseMyDomain( { domainCartItem: MAPPING_CART_ITEM } );

		expect( wpcom.req.post ).toHaveBeenCalledWith( '/sites/123/add-domain-mapping', {
			domain: 'example.com',
		} );
		expect( window.location.assign ).toHaveBeenCalledWith(
			'/domains/mapping/example.wordpress.com/setup/example.com?firstVisit=true'
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'lands on the connection setup page when the step already created the mapping after ownership verification', async () => {
		( useSite as jest.Mock ).mockReturnValue( PAID_ANNUAL_SITE );

		await submitUseMyDomain( { ownershipVerificationCompleted: true, domain: 'example.com' } );

		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( window.location.assign ).toHaveBeenCalledWith(
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
			expect.stringContaining( '/checkout/example.wordpress.com' )
		);
	} );

	it( 'goes to the plans step when the user must buy a plan before connecting', async () => {
		( useSite as jest.Mock ).mockReturnValue( FREE_SITE );

		const { navigate } = await submitUseMyDomain( { skipToPlan: true } );

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );
} );
