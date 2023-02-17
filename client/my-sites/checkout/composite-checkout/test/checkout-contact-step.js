/**
 * @jest-environment jsdom
 */
import { convertResponseCartToRequestCart } from '@automattic/shopping-cart';
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
	mockSetCartEndpointWith,
	getActivePersonalPlanDataForType,
	gSuiteProduct,
	caDomainProduct,
	mockCachedContactDetailsEndpoint,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
	mockSetVatInfoEndpoint,
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

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

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

	it( 'does not render the VAT field checkbox if the selected country does not support VAT', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( screen.queryByLabelText( 'Add VAT details' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT field checkbox if the selected country does support VAT', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeInTheDocument();
	} );

	it( 'does not render the VAT fields if the checkbox is not checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).not.toBeChecked();
		expect( screen.queryByLabelText( 'VAT Number' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT fields if the checkbox is checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toBeInTheDocument();
	} );

	it( 'does not render the Northern Ireland checkbox is if the VAT checkbox is checked and the country is EU', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'ES' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( screen.queryByLabelText( 'Is the VAT for Northern Ireland?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the Northern Ireland checkbox is if the VAT checkbox is checked and the country is GB', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect(
			await screen.findByLabelText( 'Is the VAT for Northern Ireland?' )
		).toBeInTheDocument();
	} );

	it( 'hides the Northern Ireland checkbox is if the VAT checkbox is checked and the country is changed from GB to ES', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect(
			await screen.findByLabelText( 'Is the VAT for Northern Ireland?' )
		).toBeInTheDocument();
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'ES' );
		expect( screen.queryByLabelText( 'Is the VAT for Northern Ireland?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT fields and checks the box on load if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toBeInTheDocument();
	} );

	it( 'renders the VAT fields pre-filled if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		expect( await screen.findByLabelText( 'VAT Number' ) ).toHaveValue( '12345' );
		expect( await screen.findByLabelText( 'Organization for VAT' ) ).toHaveValue( 'Test company' );
		expect( await screen.findByLabelText( 'Address for VAT' ) ).toHaveValue( '123 Main Street' );
	} );

	it( 'does not allow unchecking the VAT details checkbox if the VAT fields are pre-filled', async () => {
		nock.cleanAll();
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		const user = userEvent.setup();
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeDisabled();

		// Try to click it anyway and make sure it does not change.
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toBeInTheDocument();
	} );

	it( 'sends data to the VAT endpoint when completing the step if the box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'when there is a cached contact country that differs from the cached VAT country, the contact country is sent to the VAT endpoint', async () => {
		nock.cleanAll();
		const cachedContactCountry = 'ES';
		mockCachedContactDetailsEndpoint( {
			country_code: cachedContactCountry,
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		mockGetVatInfoEndpoint( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: countryCode,
		} );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		// Make sure the form has the autocompleted data.
		expect( countryField.selectedOptions[ 0 ].value ).toBe( cachedContactCountry );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toHaveValue( vatId );
		expect( await screen.findByLabelText( 'Organization for VAT' ) ).toHaveValue( vatName );
		expect( await screen.findByLabelText( 'Address for VAT' ) ).toHaveValue( vatAddress );

		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const mockVatEndpoint = mockSetVatInfoEndpoint();

		// Submit the form.
		await user.click( screen.getByText( 'Continue' ) );

		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: cachedContactCountry,
		} );
	} );

	it( 'sends data to the VAT endpoint with Northern Ireland country code when completing the step if the XI box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.click( await screen.findByLabelText( 'Is the VAT for Northern Ireland?' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: 'XI',
		} );
	} );

	it( 'does not send data to the VAT endpoint when completing the step if the box is not checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Uncheck the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).not.toHaveBeenCalled();
	} );

	it( 'sends VAT data to the shopping-cart endpoint when completing the step if the box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: {
					location: {
						country_code: countryCode,
						postal_code: postalCode,
						subdivision_code: undefined,
						vat_id: vatId,
						organization: vatName,
						address: vatAddress,
					},
				},
			} )
		);
	} );

	it( 'does not send VAT data to the shopping-cart endpoint when completing the step if the box is not checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Uncheck the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: { location: { country_code: countryCode, postal_code: postalCode } },
			} )
		);
	} );

	it( 'does not send VAT data to the shopping-cart endpoint when completing the step if the box is checked but the country no longer supports VAT', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const nonVatCountryCode = 'US';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Change the country to one that does not support VAT
		await user.selectOptions( await screen.findByLabelText( 'Country' ), nonVatCountryCode );

		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: { location: { country_code: nonVatCountryCode, postal_code: postalCode } },
			} )
		);
	} );

	it( 'does not complete the step if the VAT endpoint returns an error', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/me/vat-info' ).reply( 400 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue' ) );
		await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();
	} );

	it.each( [
		{
			tax: {
				country_code: 'CA',
				city: 'Montreal',
				subdivision_code: 'QC',
				postal_code: 'A1A 1A1',
			},
			labels: { subdivision_code: 'Province' },
			product: 'plan',
			expect: 'city and province',
		},
		{
			tax: { country_code: 'CA', city: 'Montreal', subdivision_code: 'QC', postal_code: 'A1A 1A1' },
			labels: { subdivision_code: 'Province' },
			product: 'plan with domain',
			expect: 'city and province',
		},
		{
			tax: { country_code: 'IN', subdivision_code: 'KA', postal_code: '123 456' },
			product: 'plan',
			expect: 'state',
		},
		{
			tax: { country_code: 'IN', subdivision_code: 'KA', postal_code: '123 456' },
			product: 'plan with domain',
			expect: 'state',
		},
		{
			tax: { country_code: 'JP', organization: 'JP Organization', postal_code: '123-4567' },
			product: 'plan',
			expect: 'organization',
		},
		{
			tax: { country_code: 'JP', organization: 'JP Organization', postal_code: '123-4567' },
			product: 'plan with domain',
			expect: 'organization',
		},
		{
			tax: {
				country_code: 'NO',
				organization: 'NO Organization',
				city: 'Oslo',
				postal_code: '1234',
			},
			product: 'plan',
			expect: 'city and organization',
		},
		{
			tax: {
				country_code: 'NO',
				organization: 'NO Organization',
				city: 'Oslo',
				postal_code: '1234',
			},
			product: 'plan with domain',
			expect: 'city and organization',
		},
	] )(
		'sends additional tax data with $expect to the shopping-cart endpoint when a country with those requirements has been chosen and a $product is in the cart',
		async ( { tax, labels, product } ) => {
			const selects = { country_code: true, subdivision_code: true };
			labels = {
				city: 'City',
				subdivision_code: 'State',
				organization: 'Organization',
				postal_code: product === 'plan' ? 'Postal code' : 'Postal Code',
				country_code: 'Country',
				...labels,
			};
			mockContactDetailsValidationEndpoint( product === 'plan' ? 'tax' : 'domain', {
				success: true,
			} );
			const user = userEvent.setup();
			const cartChanges =
				product === 'plan'
					? { products: [ planWithoutDomain ] }
					: { products: [ planWithBundledDomain, domainProduct ] };

			const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

			render(
				<MockCheckout
					{ ...defaultPropsForMockCheckout }
					cartChanges={ cartChanges }
					setCart={ setCart }
				/>
			);
			for ( const key of Object.keys( tax ) ) {
				if ( selects[ key ] ) {
					await user.selectOptions( await screen.findByLabelText( labels[ key ] ), tax[ key ] );
				} else {
					await user.type( await screen.findByLabelText( labels[ key ] ), tax[ key ] );
				}
			}

			await user.click( screen.getByText( 'Continue' ) );
			expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			expect( setCart ).toHaveBeenCalledWith(
				mainCartKey,
				convertResponseCartToRequestCart( {
					...initialCart,
					...cartChanges,
					tax: {
						location: tax,
					},
				} )
			);
		}
	);

	it.each( [
		{ vatOrganization: 'with', product: 'plan' },
		{ vatOrganization: 'without', product: 'plan' },
		{ vatOrganization: 'with', product: 'plan with domain' },
		{ vatOrganization: 'without', product: 'plan with domain' },
	] )(
		'sends both contact details and tax data to the shopping cart endpoint when a plan with domain is in the cart and VAT details have been added $vatOrganization VAT organization',
		async ( { vatOrganization, product } ) => {
			const vatId = '12345';
			const vatName = vatOrganization === 'with' ? 'VAT Organization' : 'Contact Organization';
			const vatAddress = '123 Main Street';
			const countryCode = 'GB';
			const postalCode = 'NW1 4NP';
			mockSetVatInfoEndpoint();
			mockContactDetailsValidationEndpoint( product === 'plan' ? 'tax' : 'domain', {
				success: true,
			} );
			const user = userEvent.setup();
			const cartChanges =
				product === 'plan'
					? { products: [ planWithoutDomain ] }
					: { products: [ planWithBundledDomain, domainProduct ] };

			const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

			render(
				<MockCheckout
					{ ...defaultPropsForMockCheckout }
					cartChanges={ cartChanges }
					setCart={ setCart }
				/>
			);
			await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
			await user.type(
				await screen.findByLabelText( product === 'plan' ? 'Postal code' : 'Postal Code' ),
				postalCode
			);
			await user.type( await screen.findByLabelText( 'Organization' ), 'Contact Organization' );

			// Check the box
			await user.click( await screen.findByLabelText( 'Add VAT details' ) );

			// Fill in the details
			await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
			if ( vatOrganization === 'with' ) {
				await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
			}
			await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

			await user.click( screen.getByText( 'Continue' ) );
			expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			expect( setCart ).toHaveBeenCalledWith(
				mainCartKey,
				convertResponseCartToRequestCart( {
					...initialCart,
					...cartChanges,
					tax: {
						location: {
							country_code: countryCode,
							postal_code: postalCode,
							vat_id: vatId,
							organization: vatName,
							address: vatAddress,
						},
					},
				} )
			);
		}
	);
} );
