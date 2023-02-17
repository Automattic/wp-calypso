/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { navigate } from 'calypso/lib/navigate';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	domainProduct,
	domainTransferProduct,
	planWithBundledDomain,
	planWithoutDomain,
	getActivePersonalPlanDataForType,
	gSuiteProduct,
	caDomainProduct,
	mockCachedContactDetailsEndpoint,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout contact step', () => {
	let defaultPropsForMockCheckout = {};
	const mainCartKey = 'foo.com';
	const initialCart = getBasicCart();

	getPlansBySiteId.mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	hasLoadedSiteDomains.mockImplementation( () => true );
	getDomainsBySiteId.mockImplementation( () => [] );
	isMarketplaceProduct.mockImplementation( () => false );
	isJetpackSite.mockImplementation( () => false );
	useCartKey.mockImplementation( () => mainCartKey );
	mockMatchMediaOnWindow();

	beforeEach( () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' ).persist().post( '/rest/v1.1/logstash' ).reply( 200 );
		mockGetVatInfoEndpoint( {} );

		defaultPropsForMockCheckout = {
			mainCartKey,
			initialCart,
		};
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await expect( screen.findByText( /Enter your (billing|contact) information/ ) ).toNeverAppear();
	} );

	it( 'renders the step after the contact step as active if the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Free Purchase' ) ).toBeVisible();
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		render( <MockCheckout { ...defaultPropsForMockCheckout } /> );
		expect(
			await screen.findByText( /Enter your (billing|contact) information/ )
		).toBeInTheDocument();
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Phone' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Address' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'City' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'State' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders country-specific domain fields when a country has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Address' ) ).toBeInTheDocument();
		expect( screen.getByText( 'City' ) ).toBeInTheDocument();
		expect( screen.getByText( 'State' ) ).toBeInTheDocument();
		expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a plan is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Postal code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a plan is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'CW' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'CW' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Postal Code' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
	} );

	it( 'does not complete the contact step when the contact step button has not been clicked and there are no cached details', async () => {
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
		expect( countryField.selectedOptions[ 0 ].value ).toBe( 'US' );
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
		async ( { complete, valid, name, email, logged } ) => {
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
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( '/rest/v1.1/logstash' )
				.reply( 200 );
			mockGetVatInfoEndpoint( {} );

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

			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/signups/validation/user/', ( body ) => {
					return (
						body.locale === 'en' &&
						body.is_from_registrationless_checkout === true &&
						body.email === validContactDetails.email
					);
				} )
				.reply( 200, () => {
					if ( logged === 'out' && email === 'fails' ) {
						return {
							success: false,
							messages: { email: { taken: 'An account with this email already exists.' } },
						};
					}

					return {
						success: email === 'passes',
					};
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

			await user.click( screen.getByText( 'Continue' ) );

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

	it( 'renders the checkout summary', async () => {
		render( <MockCheckout { ...defaultPropsForMockCheckout } /> );
		expect( await screen.findByText( 'Purchase Details' ) ).toBeInTheDocument();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'removes a product from the cart after clicking to remove', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 1 );
		await user.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		await user.click( confirmButton );
		await expect( screen.findByLabelText( 'WordPress.com Personal' ) ).toNeverAppear();
	} );
} );
