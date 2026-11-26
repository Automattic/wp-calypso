/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { type Mock, vi } from 'vitest';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { resetCheckoutStores } from '../lib/checkout-stores';
import {
	planWithoutDomain,
	getActivePersonalPlanDataForType,
	gSuiteProduct,
	caDomainProduct,
	mockCachedContactDetailsEndpoint,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
	countryList,
	mockLogStashEndpoint,
	mockPayPalConfigurationEndpoint,
	mockGetSiteDomainsEndpoint,
	mockGetSupportedCountriesEndpoint,
	mockGetPaymentMethodsEndpoint,
	mockUserSignupValidationEndpoint,
	mockSetCachedContactDetailsEndpoint,
	mockSetCartEndpointWith,
	normalAllowedPaymentMethods,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import { setupUserNoPointerEvents } from './util/setup-user';
import type { CartKey, SetCart } from '@automattic/shopping-cart';
import type { StoredPaymentMethodCard } from '@automattic/wpcom-checkout';

vi.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
vi.mock( 'calypso/my-sites/checkout/use-cart-key' );
vi.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
vi.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
vi.mock( 'calypso/lib/navigate' );
// Stripe must load for the card payment methods, new and saved, to be offered.
vi.mock( '@stripe/react-stripe-js', async () => ( {
	...( await vi.importActual< typeof import( '@stripe/react-stripe-js' ) >(
		'@stripe/react-stripe-js'
	) ),
	...( await vi.importActual< typeof import( './util' ) >( './util' ) ).mockStripeElements(),
} ) );
vi.mock( '@stripe/stripe-js', () => ( {
	loadStripe: async () =>
		( await vi.importActual< typeof import( './util' ) >( './util' ) )
			.mockStripeElements()
			.useStripe(),
} ) );
vi.mock( 'calypso/lib/analytics/tracks', async () => ( {
	...( await vi.importActual< typeof import( 'calypso/lib/analytics/tracks' ) >(
		'calypso/lib/analytics/tracks'
	) ),
	recordTracksEvent: vi.fn(),
} ) );

// These tests seem to be particularly slow (it might be because of using
// it.each; it's not clear but the timeout might apply to the whole loop
// rather that each iteration?), so we need to increase the timeout for their
// operation. The standard timeout (at the time of writing) is 5 seconds so
// we are increasing this to 12 seconds.
vi.setConfig( { testTimeout: 12000 } );

describe( 'Checkout contact step', () => {
	const mainCartKey = 'foo.com' as CartKey;
	const initialCart = getBasicCart();
	const defaultPropsForMockCheckout = {
		initialCart,
	};

	// A saved card needs no input, so autocomplete completes the payment step too
	// and leaves no step active.
	const storedCard: StoredPaymentMethodCard = {
		stored_details_id: '1234',
		user_id: '1',
		name: 'Test User',
		country_code: 'US',
		payment_partner: 'stripe',
		payment_partner_reference: 'pm_test',
		payment_partner_source_id: '',
		mp_ref: 'mp_ref_test',
		email: 'test@example.com',
		card_expiry_year: '2099',
		card_expiry_month: '12',
		expiry: '2099-12-31',
		remember: true,
		source: null,
		original_stored_details_id: '1234',
		is_rechargeable: true,
		payment_type: 'card',
		is_expired: false,
		is_backup: false,
		tax_location: null,
		card_type: 'visa',
		card_iin: '424242',
		card_last_4: '4242',
		card_zip: '10001',
		display_brand: null,
	};
	let storedPaymentMethods: StoredPaymentMethodCard[] = [];

	const renderCheckoutWithSavedCard = () => {
		storedPaymentMethods = [ storedCard ];
		const allowedPaymentMethods = [
			...normalAllowedPaymentMethods,
			'WPCOM_Billing_MoneyPress_Stored',
		];
		const mockSetCart = mockSetCartEndpointWith( {
			currency: initialCart.currency,
			locale: initialCart.locale,
		} );
		const setCart: SetCart = async ( cartKey, requestCart ) => ( {
			...( await mockSetCart( cartKey, requestCart ) ),
			allowed_payment_methods: allowedPaymentMethods,
		} );
		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ {
					products: [ planWithoutDomain ],
					allowed_payment_methods: allowedPaymentMethods,
				} }
				setCart={ setCart }
			/>
		);
	};

	const getTracksCalls = ( eventName: string ) =>
		( recordTracksEvent as Mock ).mock.calls.filter( ( [ event ] ) => event === eventName );

	getPlansBySiteId.mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	mockGetSiteDomainsEndpoint( [] );
	isMarketplaceProduct.mockImplementation( () => false );
	mockMatchMediaOnWindow();

	beforeEach( () => {
		resetCheckoutStores();
		( recordTracksEvent as Mock ).mockClear();
		( useCartKey as Mock ).mockImplementation( () => mainCartKey );
		nock.cleanAll();
		mockGetVatInfoEndpoint( {} );
		storedPaymentMethods = [];
		mockGetPaymentMethodsEndpoint( () => storedPaymentMethods );
		mockLogStashEndpoint();
		mockPayPalConfigurationEndpoint();
		mockSetCachedContactDetailsEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
	} );

	it( 'does not complete the contact step when the contact step button has not been clicked and there are no cached details', async () => {
		mockCachedContactDetailsEndpoint( {} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		expect( screen.queryByTestId( 'payment-method-step--visible' ) ).not.toBeInTheDocument();
	} );

	it( 'autocompletes the contact step when there are valid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: '10001',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		// Validate that fields are pre-filled
		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( 'US' );
		} );
		expect( await screen.findByLabelText( 'Postal code' ) ).toHaveValue( '10001' );

		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
	} );

	it( 'records the first step complete event when autocompleting the contact step', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: '10001',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		renderCheckoutWithSavedCard();
		await screen.findByTestId( 'payment-method-step--visible' );

		expect( getTracksCalls( 'calypso_checkout_composite_first_step_complete' ) ).toEqual( [
			[
				'calypso_checkout_composite_first_step_complete',
				{ payment_method: 'WPCOM_Billing_MoneyPress_Stored' },
			],
		] );
	} );

	it( 'records the first step complete event again only when the contact step is edited after autocompleting', async () => {
		const user = setupUserNoPointerEvents();
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: '10001',
		} );
		// The contact step is validated on autocomplete, when editing the payment
		// method, and when continuing from the contact step.
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		renderCheckoutWithSavedCard();
		await screen.findByTestId( 'payment-method-step--visible' );

		await user.click( await screen.findByLabelText( 'Edit the payment method' ) );
		await waitFor( () => {
			expect( getTracksCalls( 'calypso_checkout_composite_step_complete' ) ).toHaveLength( 2 );
		} );

		expect( getTracksCalls( 'calypso_checkout_composite_first_step_complete' ) ).toHaveLength( 1 );

		await user.click( await screen.findByLabelText( 'Edit the contact details' ) );
		await user.click( await screen.findByLabelText( 'Continue with the entered contact details' ) );
		await waitFor( () => {
			expect( getTracksCalls( 'calypso_checkout_composite_step_complete' ) ).toHaveLength( 3 );
		} );

		expect( getTracksCalls( 'calypso_checkout_composite_first_step_complete' ) ).toHaveLength( 2 );
	} );

	it( 'records the first step complete event when the contact step is completed manually', async () => {
		const user = setupUserNoPointerEvents();
		mockCachedContactDetailsEndpoint( {} );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		await user.type( await screen.findByLabelText( 'Postal code' ), '10001' );
		expect( getTracksCalls( 'calypso_checkout_composite_first_step_complete' ) ).toEqual( [] );

		await user.click( screen.getByLabelText( 'Continue with the entered contact details' ) );
		await screen.findByTestId( 'payment-method-step--visible' );

		expect( getTracksCalls( 'calypso_checkout_composite_first_step_complete' ) ).toEqual( [
			[
				'calypso_checkout_composite_first_step_complete',
				{ payment_method: 'WPCOM_Billing_Stripe_Payment_Method' },
			],
		] );
	} );

	it( 'does not autocomplete the contact step when there are invalid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: 'ABCD',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();
	} );

	it( 'does not show errors when autocompleting the contact step when there are invalid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: 'ABCD',
		} );
		mockContactDetailsValidationEndpoint( 'tax', {
			success: false,
			messages: { postal_code: [ 'Postal code error message' ] },
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		await expect( screen.findByText( 'Postal code error message' ) ).toNeverAppear();
	} );

	it( 'shows the existing-account error on the email field when it loses focus while logged-out', async () => {
		const user = setupUserNoPointerEvents();
		mockCachedContactDetailsEndpoint( { country_code: '', postal_code: '' } );
		mockUserSignupValidationEndpoint( () => [
			200,
			{
				success: false,
				messages: { email: { taken: 'An account with this email already exists.' } },
			},
		] );
		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ { products: [ planWithoutDomain ] } }
				additionalProps={ { isLoggedOutCart: true } }
			/>
		);
		await screen.findByText( 'Country' );

		await user.type( screen.getByLabelText( 'Email' ), 'test@example.com' );
		await user.tab();

		expect(
			await screen.findByText( ( content ) =>
				content.startsWith( 'That email address is already in use' )
			)
		).toBeVisible();
	} );

	it.each( [
		{ complete: 'does', valid: 'valid', name: 'plan', email: 'fails', logged: 'in' },
		{ complete: 'does not', valid: 'invalid', name: 'plan', email: 'fails', logged: 'in' },
		{ complete: 'does', valid: 'valid', name: 'domain', email: 'fails', logged: 'in' },
		{ complete: 'does not', valid: 'invalid', name: 'domain', email: 'fails', logged: 'in' },
		{ complete: 'does', valid: 'valid', name: 'gsuite', email: 'fails', logged: 'in' },
		{ complete: 'does not', valid: 'invalid', name: 'gsuite', email: 'fails', logged: 'in' },
		{ complete: 'does', valid: 'valid', name: 'plan', email: 'passes', logged: 'out' },
		{ complete: 'does not', valid: 'invalid', name: 'plan', email: 'passes', logged: 'out' },
		{ complete: 'does not', valid: 'valid', name: 'domain', email: 'fails', logged: 'out' },
		{ complete: 'does not', valid: 'invalid', name: 'plan', email: 'fails', logged: 'out' },
	] )(
		'$complete complete the contact step when validation is $valid with $name in the cart while logged-$logged and signup validation $email',
		async ( {
			complete,
			valid,
			name,
			email,
			logged,
		}: {
			complete: 'does' | 'does not';
			valid: 'valid' | 'invalid';
			name: 'plan' | 'domain' | 'gsuite';
			email: 'fails' | 'passes';
			logged: 'in' | 'out';
		} ) => {
			const user = setupUserNoPointerEvents();

			const product = ( () => {
				switch ( name ) {
					case 'plan':
						return planWithoutDomain;
					case 'domain':
						return caDomainProduct;
					case 'gsuite':
						return gSuiteProduct;
				}
			} )();

			const validContactDetails = {
				postal_code: '10001',
				country_code: 'US',
				email: 'test@example.com',
			};

			const messages = ( () => {
				if ( valid === 'valid' ) {
					return undefined;
				}
				if ( name === 'domain' ) {
					return {
						postal_code: [ 'Postal code error message' ],
						'extra.ca.cira_agreement_accepted': [ 'Missing CIRA agreement' ],
					};
				}
				return {
					postal_code: [ 'Postal code error message' ],
				};
			} )();

			mockCachedContactDetailsEndpoint( {
				country_code: '',
				postal_code: '',
			} );
			mockContactDetailsValidationEndpoint(
				name === 'plan' ? 'tax' : name,
				{
					success: valid === 'valid',
					messages,
				},
				( body ) => {
					if (
						body.contact_information.postal_code === validContactDetails.postal_code &&
						body.contact_information.country_code === validContactDetails.country_code
					) {
						if ( name === 'domain' ) {
							return (
								body.contact_information.email === validContactDetails.email &&
								body.domain_names[ 0 ] === product.meta
							);
						}
						if ( name === 'gsuite' ) {
							return body.domain_names[ 0 ] === product.meta;
						}
						return true;
					}
				}
			);

			mockUserSignupValidationEndpoint( () => {
				if ( logged === 'out' && email === 'fails' ) {
					return [
						200,
						{
							success: false,
							messages: { email: { taken: 'An account with this email already exists.' } },
						},
					];
				}
				return [
					200,
					{
						success: email === 'passes',
					},
				];
			} ).mockImplementation( ( body ) => {
				return (
					body.locale === 'en' &&
					body.is_from_registrationless_checkout === true &&
					body.email === validContactDetails.email
				);
			} );

			render(
				<MockCheckout
					{ ...defaultPropsForMockCheckout }
					cartChanges={ { products: [ product ] } }
					additionalProps={ { isLoggedOutCart: logged === 'out' } }
				/>
			);

			// Wait for the cart to load
			await screen.findByText( 'Country' );

			// Fill in the contact form
			if ( name === 'domain' || logged === 'out' ) {
				await user.type( screen.getByLabelText( 'Email' ), validContactDetails.email );
			}
			await user.selectOptions(
				await screen.findByLabelText( 'Country' ),
				validContactDetails.country_code
			);
			await user.type(
				screen.getByLabelText( /(Postal|ZIP) code/i ),
				validContactDetails.postal_code
			);

			await user.click( screen.getByText( 'Continue to payment' ) );

			/* eslint-disable vitest/no-conditional-expect */
			if ( complete === 'does' ) {
				expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			} else {
				await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();

				// Make sure the error message is displayed
				if ( valid !== 'valid' ) {
					if ( logged === 'out' && email === 'fails' ) {
						expect(
							screen.getByText( ( content ) =>
								content.startsWith( 'That email address is already in use' )
							)
						).toBeInTheDocument();
					} else if ( email === 'passes' ) {
						expect( screen.getByText( 'Postal code error message' ) ).toBeInTheDocument();
					}

					if ( name === 'domain' ) {
						expect( screen.getByText( 'Missing CIRA agreement' ) ).toBeInTheDocument();
					}
				}
			}
			/* eslint-enable vitest/no-conditional-expect */
		}
	);
} );
