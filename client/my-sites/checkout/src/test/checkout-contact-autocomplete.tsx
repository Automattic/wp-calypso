/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import nock from 'nock';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
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
	mockGetSupportedCountriesEndpoint,
	mockGetPaymentMethodsEndpoint,
	mockUserSignupValidationEndpoint,
	mockSetCachedContactDetailsEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { CartKey } from '@automattic/shopping-cart';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

// These tests seem to be particularly slow (it might be because of using
// it.each; it's not clear but the timeout might apply to the whole loop
// rather that each iteration?), so we need to increase the timeout for their
// operation. The standard timeout (at the time of writing) is 5 seconds so
// we are increasing this to 12 seconds.
jest.setTimeout( 12000 );

describe( 'Checkout contact step', () => {
	const mainCartKey = 'foo.com' as CartKey;
	const initialCart = getBasicCart();
	const defaultPropsForMockCheckout = {
		initialCart,
	};

	getPlansBySiteId.mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	hasLoadedSiteDomains.mockImplementation( () => true );
	getDomainsBySiteId.mockImplementation( () => [] );
	isMarketplaceProduct.mockImplementation( () => false );
	isJetpackSite.mockImplementation( () => false );
	mockMatchMediaOnWindow();

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );
		nock.cleanAll();
		mockGetVatInfoEndpoint( {} );
		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockSetCachedContactDetailsEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
	} );

	it( 'does not complete the contact step when the contact step button has not been clicked and there are no cached details', async () => {
		mockCachedContactDetailsEndpoint( {} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
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
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
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

	it( 'does not autocomplete the contact step when there are invalid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: 'ABCD',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
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
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		await expect( screen.findByText( 'Postal code error message' ) ).toNeverAppear();
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
			const user = userEvent.setup();

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
				/>,
				{ legacyRoot: true }
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

			/* eslint-disable jest/no-conditional-expect */
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
						);
					} else if ( email === 'passes' ) {
						expect( screen.getByText( 'Postal code error message' ) ).toBeInTheDocument();
					}

					if ( name === 'domain' ) {
						expect( screen.getByText( 'Missing CIRA agreement' ) ).toBeInTheDocument();
					}
				}
			}
			/* eslint-enable jest/no-conditional-expect */
		}
	);
} );
