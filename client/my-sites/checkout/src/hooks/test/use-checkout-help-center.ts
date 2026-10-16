/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { useProductsWithPremiumSupport } from '@automattic/help-center/src/hooks';
import { act, renderHook } from '@testing-library/react';
import { loadCheckoutSupportVariation } from '../../lib/checkout-support-routing';
import { useCheckoutHelpCenter } from '../use-checkout-help-center';

const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();
let mockIsHelpCenterShown = false;
let mockIsLoggedIn = true;
let mockSectionName = 'checkout';
let mockIsJetpackSite = false;
let mockIsAtomicSite = false;

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: jest.fn() },
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

jest.mock( '@automattic/help-center/src/hooks', () => ( {
	useProductsWithPremiumSupport: jest.fn(),
	useProductsCustomOptions: () => ( {} ),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
} ) );

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: () => ( { responseCart: { products: [] } } ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setShowHelpCenter: mockSetShowHelpCenter,
		setNavigateToRoute: mockSetNavigateToRoute,
	} ),
	useSelect: () => mockIsHelpCenterShown,
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: () => [ false, null ],
} ) );

jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => ( {
	__esModule: true,
	default: () => 'cart-key',
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: () => unknown ) => selector(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: () => mockIsLoggedIn,
} ) );

jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: () => mockIsAtomicSite,
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: () => mockIsJetpackSite,
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSectionName: () => mockSectionName,
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

jest.mock( '../../lib/checkout-support-routing', () => ( {
	loadCheckoutSupportVariation: jest.fn(),
} ) );

const mockIsEnabled = config.isEnabled as jest.Mock;
const mockUseProductsWithPremiumSupport = useProductsWithPremiumSupport as jest.Mock;
const mockLoadCheckoutSupportVariation = loadCheckoutSupportVariation as jest.Mock;

const openHelpCenter = async () => {
	const { result } = renderHook( () => useCheckoutHelpCenter() );
	await act( async () => {
		await result.current.toggleHelpCenter();
	} );
};

const shownWith = () => mockSetShowHelpCenter.mock.calls.at( -1 )?.[ 1 ];
const route = () => mockSetNavigateToRoute.mock.calls.at( -1 )?.[ 0 ];

describe( 'useCheckoutHelpCenter – checkout support experiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsHelpCenterShown = false;
		mockIsLoggedIn = true;
		mockSectionName = 'checkout';
		mockIsJetpackSite = false;
		mockIsAtomicSite = false;
		window.history.replaceState( null, '', '/checkout/example.wordpress.com' );
		mockIsEnabled.mockImplementation( ( flag: string ) => flag === 'checkout/support-routing' );
		mockUseProductsWithPremiumSupport.mockReturnValue( {
			hasPremiumSupport: false,
			userFieldMessage: null,
			helpCenterButtonLink: 'Need help?',
		} );
	} );

	it( 'sends the human-only variation straight to a human', async () => {
		mockLoadCheckoutSupportVariation.mockResolvedValue( 'human_only' );

		await openHelpCenter();

		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: 'human_only' } );
		expect( route() ).toBe( '/odie?provider=zendesk&siteUrl=example.wordpress.com&siteId=123' );
	} );

	it.each( [ 'hybrid', 'control' ] )( 'sends the %s variation to Odie', async ( variation ) => {
		mockLoadCheckoutSupportVariation.mockResolvedValue( variation );

		await openHelpCenter();

		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: variation } );
		expect( route() ).toBe( '/odie' );
	} );

	it( 'opens the usual Help Center when the user gets no variation', async () => {
		mockLoadCheckoutSupportVariation.mockResolvedValue( undefined );

		await openHelpCenter();

		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: undefined } );
		expect( route() ).toBe( '/odie' );
	} );

	it.each( [
		[ 'when the feature flag is off', () => mockIsEnabled.mockReturnValue( false ) ],
		[ 'on the thank-you page', () => ( mockSectionName = 'checkout-thank-you' ) ],
		[ 'on the pending page', () => ( mockSectionName = 'checkout-pending' ) ],
		[ 'when logged out', () => ( mockIsLoggedIn = false ) ],
		[
			'in the Jetpack checkout',
			() => window.history.replaceState( null, '', '/checkout/jetpack/jetpack_backup_t1_yearly' ),
		],
		[
			'in the Akismet checkout',
			() => window.history.replaceState( null, '', '/checkout/akismet/ak_plus_yearly_1' ),
		],
		[
			'in the agency checkout',
			() => window.history.replaceState( null, '', '/checkout/agency/purchase' ),
		],
		[ 'for a Jetpack site', () => ( mockIsJetpackSite = true ) ],
	] )( 'leaves users out of the experiment %s', async ( _case, setUp ) => {
		setUp();

		await openHelpCenter();

		expect( mockLoadCheckoutSupportVariation ).not.toHaveBeenCalled();
		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: undefined } );
		expect( route() ).toBe( '/odie' );
	} );

	it( 'keeps Atomic sites in the experiment', async () => {
		mockIsJetpackSite = true;
		mockIsAtomicSite = true;
		mockLoadCheckoutSupportVariation.mockResolvedValue( 'human_only' );

		await openHelpCenter();

		expect( mockLoadCheckoutSupportVariation ).toHaveBeenCalled();
		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: 'human_only' } );
	} );

	it( 'keeps carts with premium support out of the experiment', async () => {
		mockUseProductsWithPremiumSupport.mockReturnValue( {
			hasPremiumSupport: true,
			userFieldMessage: 'Automated message',
			userFieldFlowName: 'messaging_flow_dotcom_100_year_plan',
			helpCenterButtonLink: 'Need help?',
		} );

		await openHelpCenter();

		expect( mockLoadCheckoutSupportVariation ).not.toHaveBeenCalled();
		expect( route() ).toContain( '/odie?provider=zendesk' );
		expect( route() ).toContain( 'userFieldFlowName=messaging_flow_dotcom_100_year_plan' );
	} );

	it( 'does not assign a variation when closing the Help Center', async () => {
		mockIsHelpCenterShown = true;

		await openHelpCenter();

		expect( mockLoadCheckoutSupportVariation ).not.toHaveBeenCalled();
		expect( mockSetShowHelpCenter.mock.calls.at( -1 )?.[ 0 ] ).toBe( false );
	} );
} );
