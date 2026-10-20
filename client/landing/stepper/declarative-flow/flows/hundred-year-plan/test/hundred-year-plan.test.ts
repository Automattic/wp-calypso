/**
 * @jest-environment jsdom
 */
import { PLAN_100_YEARS } from '@automattic/calypso-products';
import { addProductsToCart } from '@automattic/onboarding';
import hundredYearPlanFlow from '../hundred-year-plan';

let mockPendingAction: ( () => Promise< unknown > ) | undefined;

// Both packages import themselves while loading, so the real exports are read lazily rather than spread.
const lazilyOverride = ( moduleName: string, overrides: Record< string, unknown > ) =>
	new Proxy( overrides, {
		get: ( target, key: string ) =>
			key in target ? target[ key ] : jest.requireActual( moduleName )[ key ],
	} );

jest.mock( '@automattic/onboarding', () =>
	lazilyOverride( '@automattic/onboarding', {
		HUNDRED_YEAR_PLAN_FLOW: 'hundred-year-plan',
		addProductsToCart: jest.fn( () => Promise.resolve() ),
	} )
);

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	USER_STORE: 'USER_STORE',
} ) );

jest.mock( '@wordpress/data', () =>
	lazilyOverride( '@wordpress/data', {
		useSelect: ( mapSelect: ( select: () => unknown ) => unknown ) =>
			mapSelect( () => ( { getCurrentUser: () => ( { site_count: 1 } ) } ) ),
		useDispatch: () => ( {
			setPendingAction: ( action: () => Promise< unknown > ) => {
				mockPendingAction = action;
			},
			setPlanCartItem: jest.fn(),
			setDomainCartItem: jest.fn(),
		} ),
	} )
);

jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupDestinationCookie: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
} ) );

describe( 'hundred-year-plan flow', () => {
	beforeEach( () => {
		mockPendingAction = undefined;
		jest.clearAllMocks();
	} );

	it( 'returns the numeric site ID from the site-picker pending action', async () => {
		const navigate = jest.fn();
		const { submit } = hundredYearPlanFlow.useStepNavigation( 'site-picker', navigate );

		submit?.( { siteSlug: 'example.wordpress.com', siteId: 123 } );

		expect( navigate ).toHaveBeenCalledWith( 'processing' );
		await expect( mockPendingAction?.() ).resolves.toEqual( {
			siteId: 123,
			siteSlug: 'example.wordpress.com',
			goToCheckout: true,
		} );
		expect( addProductsToCart ).toHaveBeenCalledWith(
			'example.wordpress.com',
			'hundred-year-plan',
			[ { product_slug: PLAN_100_YEARS } ]
		);
	} );
} );
