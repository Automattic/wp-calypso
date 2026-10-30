/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useProductsWithPremiumSupport } from '@automattic/help-center/src/hooks';
import { act, renderHook } from '@testing-library/react';
import { loadCheckoutSupportAssignment } from '../../lib/checkout-support-routing';
import { useCheckoutHelpCenter } from '../use-checkout-help-center';

const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockSetIsMinimized = jest.fn();
let mockIsHelpCenterShown = false;
let mockIsMinimized = false;
let mockStoredVariation: string | undefined;
let mockIsLoggedIn = true;
let mockSectionName = 'checkout';
let mockSiteId: number | null = 123;
let mockIsJetpackSite = false;
let mockIsAtomicSite = false;
let mockCartProducts: { product_slug: string; is_renewal?: boolean }[] = [];
let mockIsCartLoading = false;
let mockIsCartUpdating = false;

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: jest.fn() },
} ) );

// The package's UI imports don't load with the mocked data module, so stand in for its slug checks.
jest.mock( '@automattic/calypso-products', () => ( {
	isWpComPlan: ( slug: string ) => slug === 'personal-bundle',
	isDomainProduct: ( { product_slug }: { product_slug: string } ) => product_slug === 'domain_reg',
	isDomainTransfer: ( { product_slug }: { product_slug: string } ) =>
		product_slug === 'domain_transfer',
	isGSuiteOrGoogleWorkspace: ( { product_slug }: { product_slug: string } ) =>
		product_slug === 'google_workspace_business_starter_yearly',
	isTitanMail: ( { product_slug }: { product_slug: string } ) =>
		product_slug === 'wp_titan_mail_yearly',
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
	useShoppingCart: () => ( {
		responseCart: { products: mockCartProducts },
		isLoading: mockIsCartLoading,
		isPendingUpdate: mockIsCartUpdating,
	} ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setShowHelpCenter: mockSetShowHelpCenter,
		setNavigateToRoute: mockSetNavigateToRoute,
		setIsMinimized: mockSetIsMinimized,
	} ),
	useSelect: ( mapSelect: ( select: () => unknown ) => unknown ) =>
		mapSelect( () => ( {
			isHelpCenterShown: () => mockIsHelpCenterShown,
			getIsMinimized: () => mockIsMinimized,
			getCheckoutSupportVariation: () => mockStoredVariation,
		} ) ),
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
	getSelectedSiteId: () => mockSiteId,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

jest.mock( '../../lib/checkout-support-routing', () => ( {
	loadCheckoutSupportAssignment: jest.fn(),
} ) );

const mockIsEnabled = config.isEnabled as jest.Mock;
const mockUseProductsWithPremiumSupport = useProductsWithPremiumSupport as jest.Mock;
const mockLoadCheckoutSupportAssignment = loadCheckoutSupportAssignment as jest.Mock;

// The result of assigning the user to the checkout support experiment.
const assigned = ( variation?: string, { timedOut = false, durationMs = 150 } = {} ) => ( {
	variation,
	timedOut,
	durationMs,
} );

const openHelpCenter = async () => {
	const { result } = renderHook( () => useCheckoutHelpCenter() );
	await act( async () => {
		await result.current.toggleHelpCenter();
	} );
};

// A checkout with no site selected, such as a renewal or a siteless checkout for another brand.
const siteless = ( path: string, ...productSlugs: string[] ) => {
	window.history.replaceState( null, '', path );
	mockSiteId = null;
	mockCartProducts = productSlugs.map( ( product_slug ) => ( { product_slug } ) );
};

const shownWith = () => mockSetShowHelpCenter.mock.calls.at( -1 )?.[ 1 ];
const route = () => mockSetNavigateToRoute.mock.calls.at( -1 )?.[ 0 ];

describe( 'useCheckoutHelpCenter – checkout support experiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsHelpCenterShown = false;
		mockIsMinimized = false;
		mockStoredVariation = undefined;
		mockIsLoggedIn = true;
		mockSectionName = 'checkout';
		mockSiteId = 123;
		mockIsJetpackSite = false;
		mockIsAtomicSite = false;
		mockCartProducts = [ { product_slug: 'personal-bundle' } ];
		mockIsCartLoading = false;
		mockIsCartUpdating = false;
		window.history.replaceState( null, '', '/checkout/example.wordpress.com' );
		mockIsEnabled.mockImplementation( ( flag: string ) => flag === 'checkout/support-routing' );
		mockUseProductsWithPremiumSupport.mockReturnValue( {
			hasPremiumSupport: false,
			userFieldMessage: null,
			helpCenterButtonLink: 'Need help?',
		} );
	} );

	it( 'sends the human-only variation straight to a human', async () => {
		mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'human_only' ) );

		await openHelpCenter();

		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: 'human_only' } );
		expect( route() ).toBe( '/odie?provider=zendesk&siteUrl=example.wordpress.com&siteId=123' );
	} );

	it.each( [ 'hybrid', 'control' ] )( 'sends the %s variation to Odie', async ( variation ) => {
		mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( variation ) );

		await openHelpCenter();

		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: variation } );
		expect( route() ).toBe( '/odie' );
	} );

	it( 'opens the usual Help Center when the user gets no variation', async () => {
		mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned() );

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
			() => siteless( '/checkout/jetpack/jetpack_backup_t1_yearly', 'jetpack_backup_t1_yearly' ),
		],
		[
			'in the Akismet checkout',
			() => siteless( '/checkout/akismet/ak_plus_yearly_1', 'ak_plus_yearly_1' ),
		],
		[
			'in the agency checkout, even for a WordPress.com plan',
			() => window.history.replaceState( null, '', '/checkout/agency/purchase' ),
		],
		[ 'for a Jetpack site', () => ( mockIsJetpackSite = true ) ],
		[
			'when renewing a Jetpack product',
			() => siteless( '/checkout/renew/123', 'jetpack_backup_t1_yearly' ),
		],
		[
			'when renewing an Akismet product',
			() => siteless( '/checkout/renew/123', 'ak_plus_yearly_1' ),
		],
		[
			'for any other checkout without a site',
			() => siteless( '/checkout/new-brand/some_new_product', 'some_new_product' ),
		],
		[
			'without a site when only some products are WordPress.com ones',
			() => siteless( '/checkout/renew/123', 'personal-bundle', 'jetpack_backup_t1_yearly' ),
		],
		[ 'when the cart is empty', () => ( mockCartProducts = [] ) ],
		[
			'while the cart loads',
			() => {
				mockIsCartLoading = true;
				mockCartProducts = [];
			},
		],
		[
			'while the renewal is added to the cart',
			() => {
				siteless( '/checkout/renew/123' );
				mockIsCartUpdating = true;
			},
		],
	] )( 'leaves users out of the experiment %s', async ( _case, setUp ) => {
		setUp();

		await openHelpCenter();

		expect( mockLoadCheckoutSupportAssignment ).not.toHaveBeenCalled();
		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: undefined } );
		expect( route() ).toBe( '/odie' );
	} );

	it.each( [
		[
			'a site whose address starts with a brand name',
			() => window.history.replaceState( null, '', '/checkout/agencynews.wordpress.com/personal' ),
		],
		[ 'a WordPress.com renewal', () => siteless( '/checkout/renew/123', 'personal-bundle' ) ],
		[
			'a domain-only purchase',
			() => siteless( '/checkout/no-site', 'domain_reg', 'wp_titan_mail_yearly' ),
		],
		[
			'a WordPress.com site buying a Jetpack product',
			() => ( mockCartProducts = [ { product_slug: 'jetpack_backup_t1_yearly' } ] ),
		],
	] )( 'keeps %s in the experiment', async ( _case, setUp ) => {
		setUp();
		mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'human_only' ) );

		await openHelpCenter();

		expect( mockLoadCheckoutSupportAssignment ).toHaveBeenCalled();
		expect( shownWith() ).toMatchObject( { checkoutSupportVariation: 'human_only' } );
	} );

	it( 'keeps Atomic sites in the experiment', async () => {
		mockIsJetpackSite = true;
		mockIsAtomicSite = true;
		mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'human_only' ) );

		await openHelpCenter();

		expect( mockLoadCheckoutSupportAssignment ).toHaveBeenCalled();
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

		expect( mockLoadCheckoutSupportAssignment ).not.toHaveBeenCalled();
		expect( route() ).toContain( '/odie?provider=zendesk' );
		expect( route() ).toContain( 'userFieldFlowName=messaging_flow_dotcom_100_year_plan' );
	} );

	it( 'records closing the Help Center', async () => {
		mockIsHelpCenterShown = true;

		await openHelpCenter();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_thank_you_inlinehelp_close',
			expect.anything()
		);
	} );

	it( 'does not assign a variation when closing the Help Center', async () => {
		mockIsHelpCenterShown = true;

		await openHelpCenter();

		expect( mockLoadCheckoutSupportAssignment ).not.toHaveBeenCalled();
		expect( mockSetShowHelpCenter.mock.calls.at( -1 )?.[ 0 ] ).toBe( false );
	} );

	describe( 'when the Help Center is minimized', () => {
		beforeEach( () => {
			// A minimized Help Center still counts as shown.
			mockIsHelpCenterShown = true;
			mockIsMinimized = true;
		} );

		it( 'records bringing it back as showing it', async () => {
			mockStoredVariation = 'human_only';

			await openHelpCenter();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_thank_you_inlinehelp_show',
				expect.anything()
			);
			expect( recordTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_thank_you_inlinehelp_close',
				expect.anything()
			);
		} );

		it( 'brings back a checkout support chat as it was', async () => {
			mockStoredVariation = 'human_only';

			await openHelpCenter();

			expect( mockSetIsMinimized ).toHaveBeenCalledWith( false );
			expect( mockLoadCheckoutSupportAssignment ).not.toHaveBeenCalled();
			expect( mockSetShowHelpCenter ).not.toHaveBeenCalled();
			expect( mockSetNavigateToRoute ).not.toHaveBeenCalled();
		} );

		it( 'opens it for the variation when it was minimized before checkout', async () => {
			mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'human_only' ) );

			await openHelpCenter();

			expect( mockLoadCheckoutSupportAssignment ).toHaveBeenCalled();
			expect( mockSetShowHelpCenter ).toHaveBeenCalledWith(
				true,
				expect.objectContaining( { checkoutSupportVariation: 'human_only' } )
			);
			expect( route() ).toBe( '/odie?provider=zendesk&siteUrl=example.wordpress.com&siteId=123' );
		} );
	} );

	describe( 'while the assignment loads', () => {
		let resolveAssignment: ( variation: string ) => void;

		beforeEach( () => {
			mockLoadCheckoutSupportAssignment.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveAssignment = ( variation ) => resolve( assigned( variation ) );
				} )
			);
		} );

		it( 'opens the Help Center once when the button is clicked again', async () => {
			const { result } = renderHook( () => useCheckoutHelpCenter() );

			await act( async () => {
				const firstClick = result.current.toggleHelpCenter();
				const secondClick = result.current.toggleHelpCenter();
				resolveAssignment( 'human_only' );
				await Promise.all( [ firstClick, secondClick ] );
			} );

			expect( mockSetShowHelpCenter ).toHaveBeenCalledTimes( 1 );
			expect( mockSetNavigateToRoute ).toHaveBeenCalledTimes( 1 );
			expect( shownWith() ).toMatchObject( { checkoutSupportVariation: 'human_only' } );
		} );

		it( "doesn't open the Help Center after paying moves on to the pending page", async () => {
			const { result } = renderHook( () => useCheckoutHelpCenter() );

			await act( async () => {
				const click = result.current.toggleHelpCenter();
				window.history.replaceState(
					null,
					'',
					'/checkout/thank-you/example.wordpress.com/pending'
				);
				resolveAssignment( 'human_only' );
				await click;
			} );

			expect( mockSetShowHelpCenter ).not.toHaveBeenCalled();
			expect( mockSetNavigateToRoute ).not.toHaveBeenCalled();
		} );

		it( "doesn't open the Help Center after the user leaves checkout", async () => {
			const { result, unmount } = renderHook( () => useCheckoutHelpCenter() );

			await act( async () => {
				const click = result.current.toggleHelpCenter();
				unmount();
				resolveAssignment( 'human_only' );
				await click;
			} );

			expect( mockSetShowHelpCenter ).not.toHaveBeenCalled();
			expect( mockSetNavigateToRoute ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'the checkout entry event', () => {
		const openEvents = () =>
			( recordTracksEvent as jest.Mock ).mock.calls.filter(
				( [ name ] ) => name === 'calypso_checkout_support_open'
			);

		it( 'records opening support from checkout, with the variation and the cart', async () => {
			mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'human_only' ) );

			await openHelpCenter();

			expect( openEvents() ).toEqual( [
				[
					'calypso_checkout_support_open',
					{
						checkout_support_variation: 'human_only',
						can_join_experiment: true,
						assignment_timed_out: false,
						assignment_ms: 150,
						is_logged_in: true,
						cart_type: 'new_purchase',
						has_premium_support: false,
					},
				],
			] );
		} );

		it( 'records an assignment that took too long, without a variation', async () => {
			mockLoadCheckoutSupportAssignment.mockResolvedValue(
				assigned( undefined, { timedOut: true, durationMs: 2000 } )
			);

			await openHelpCenter();

			expect( openEvents()[ 0 ][ 1 ] ).toEqual( {
				can_join_experiment: true,
				assignment_timed_out: true,
				assignment_ms: 2000,
				is_logged_in: true,
				cart_type: 'new_purchase',
				has_premium_support: false,
			} );
		} );

		it.each( [
			[ 'renewal', [ { product_slug: 'personal-bundle', is_renewal: true } ] ],
			[
				'mixed',
				[ { product_slug: 'personal-bundle', is_renewal: true }, { product_slug: 'domain_reg' } ],
			],
		] )( 'records a %s cart', async ( cartType, products ) => {
			mockCartProducts = products;
			mockLoadCheckoutSupportAssignment.mockResolvedValue( assigned( 'control' ) );

			await openHelpCenter();

			expect( openEvents()[ 0 ][ 1 ] ).toMatchObject( { cart_type: cartType } );
		} );

		it( 'records users who are not in the experiment, without assignment details', async () => {
			mockIsLoggedIn = false;

			await openHelpCenter();

			expect( openEvents()[ 0 ][ 1 ] ).toEqual( {
				can_join_experiment: false,
				is_logged_in: false,
				cart_type: 'new_purchase',
				has_premium_support: false,
			} );
		} );

		it.each( [
			[ 'when closing the Help Center', () => ( mockIsHelpCenterShown = true ) ],
			[ 'on the thank-you page', () => ( mockSectionName = 'checkout-thank-you' ) ],
			[
				'when bringing back a minimized checkout support chat',
				() => {
					mockIsHelpCenterShown = true;
					mockIsMinimized = true;
					mockStoredVariation = 'human_only';
				},
			],
		] )( 'is not recorded %s', async ( _case, setUp ) => {
			setUp();

			await openHelpCenter();

			expect( openEvents() ).toHaveLength( 0 );
		} );
	} );
} );
