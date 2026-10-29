/**
 * @jest-environment jsdom
 */
import { Visibility } from '@automattic/data-stores';
import { persistSignupDestination, setSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { goToUnifiedCheckout } from '../checkout';

jest.mock( 'calypso/signup/storageUtils' );

const originalLocation = window.location;
const assign = jest.fn();
const options = {
	flowName: 'static-site-import',
	plan: 'business-bundle',
	userIsLoggedIn: false,
	destination:
		'/setup/static-site-import/static-site-import-reading?from=source.example.com&platform=wix&siteId=:siteId',
	cancelDestination: '/setup/static-site-import/plans?from=source.example.com&platform=wix',
	siteIntent: 'site-migration',
};

describe( 'goToUnifiedCheckout', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...originalLocation, assign },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation } );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		window.localStorage.clear();
	} );

	it.each( [ false, true ] )(
		'requests account creation only when signed out (logged in: %s)',
		( userIsLoggedIn ) => {
			goToUnifiedCheckout( { ...options, userIsLoggedIn } );

			const url = new URL( assign.mock.calls[ 0 ][ 0 ], 'https://example.com' );
			expect( url.pathname ).toBe( '/checkout/unified/business-bundle' );
			expect( url.searchParams.get( 'signup' ) ).toBe( userIsLoggedIn ? null : '1' );
			expect( url.searchParams.get( 'flow' ) ).toBe( options.flowName );
			expect( url.searchParams.get( 'redirect_to' ) ).toBe( options.destination );
			expect( url.searchParams.get( 'cancel_to' ) ).toBe( options.cancelDestination );
		}
	);

	it( 'prepares a coming-soon migration site and persists the completion destination', () => {
		goToUnifiedCheckout( options );

		expect( JSON.parse( window.localStorage.getItem( 'siteParams' )! ) ).toEqual( {
			blog_name: '',
			blog_title: 'My Site',
			public: Visibility.PublicNotIndexed,
			options: {
				site_creation_flow: options.flowName,
				wpcom_public_coming_soon: 1,
				site_intent: 'site-migration',
			},
			find_available_url: true,
			validate: false,
		} );
		expect( persistSignupDestination ).toHaveBeenCalledWith( options.destination );
		expect( setSignupCompleteFlowName ).toHaveBeenCalledWith( options.flowName );
	} );

	it( 'preserves campaign, coupon, and back URL parameters', () => {
		const checkoutBackUrl =
			'https://wordpress.com/setup/static-site-import/plans?from=source.example.com&platform=wix';
		goToUnifiedCheckout( {
			...options,
			extraQueryParams: {
				coupon: 'PROMO',
				ref: 'migration',
				source: 'campaign',
				checkoutBackUrl,
			},
		} );

		const url = new URL( assign.mock.calls[ 0 ][ 0 ], 'https://example.com' );
		expect( Object.fromEntries( url.searchParams ) ).toMatchObject( {
			coupon: 'PROMO',
			ref: 'migration',
			source: 'campaign',
			checkoutBackUrl,
		} );
	} );
} );
