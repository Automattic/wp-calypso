/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { render, screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { navigate } from 'calypso/lib/navigate';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CheckoutMain from '../components/checkout-main';
import {
	siteId,
	domainProduct,
	domainTransferProduct,
	planWithBundledDomain,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	createTestReduxStore,
	countryList,
	gSuiteProduct,
	caDomainProduct,
	mockCachedContactDetailsEndpoint,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
} from './util';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout contact step', () => {
	let MyCheckout;
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
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/vat-info' )
			.optionally()
			.reply( 200, {} );

		const store = createTestReduxStore();
		const queryClient = new QueryClient();

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			return (
				<ReduxProvider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<ShoppingCartProvider
							managerClient={ managerClient }
							options={ {
								defaultCartKey: mainCartKey,
							} }
							{ ...additionalCartProps }
						>
							<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
								<CheckoutMain
									siteId={ siteId }
									siteSlug="foo.com"
									getStoredCards={ async () => [] }
									overrideCountryList={ countryList }
									{ ...additionalProps }
								/>
							</StripeHookProvider>
						</ShoppingCartProvider>
					</QueryClientProvider>
				</ReduxProvider>
			);
		};
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await expect( screen.findByText( /Enter your (billing|contact) information/ ) ).toNeverAppear();
	} );

	it( 'renders the step after the contact step as active if the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Free Purchase' ) ).toBeVisible();
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		render( <MyCheckout /> );
		expect(
			await screen.findByText( /Enter your (billing|contact) information/ )
		).toBeInTheDocument();
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Phone' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Postal code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a plan is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'CW' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
		// Wait for the cart to load
		await screen.findByText( 'Country' );

		// Wait for the validation to complete.
		await screen.findAllByText( 'Please wait…' );
		await waitForElementToBeRemoved( () => screen.queryAllByText( 'Please wait…' ) );

		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
	} );

	it( 'does not autocomplete the contact step when there are invalid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: 'ABCD',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me/vat-info' )
				.optionally()
				.reply( 200, {} );

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
				<MyCheckout
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
		render( <MyCheckout /> );
		expect( await screen.findByText( 'Purchase Details' ) ).toBeInTheDocument();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'removes a product from the cart after clicking to remove', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
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
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( screen.queryByLabelText( 'Add VAT details' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT field checkbox if the selected country does support VAT', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeInTheDocument();
	} );

	it( 'does not render the VAT fields if the checkbox is not checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).not.toBeChecked();
		expect( screen.queryByLabelText( 'VAT Number' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT fields if the checkbox is checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toBeInTheDocument();
	} );

	it( 'does not render the Northern Ireland checkbox is if the VAT checkbox is checked and the country is EU', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'ES' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( screen.queryByLabelText( 'Is the VAT for Northern Ireland?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the Northern Ireland checkbox is if the VAT checkbox is checked and the country is GB', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect(
			await screen.findByLabelText( 'Is the VAT for Northern Ireland?' )
		).toBeInTheDocument();
	} );

	it( 'renders the VAT fields and checks the box on load if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/vat-info' ).reply( 200, {
			id: '12345',
			name: 'Test company',
		} );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT Number' ) ).toBeInTheDocument();
	} );

	it( 'renders the VAT fields pre-filled if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/vat-info' ).reply( 200, {
			id: '12345',
			name: 'Test company',
		} );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'VAT Number' ) ).toHaveValue( '12345' );
		expect( await screen.findByLabelText( 'Organization for VAT' ) ).toHaveValue( 'Test company' );
	} );

	it( 'sends data to the VAT endpoint when completing the step if the box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const countryCode = 'GB';
		const mockVatEndpoint = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/vat-info', ( body ) => {
				if ( body.id === vatId && body.name === vatName && body.country === countryCode ) {
					return true;
				}
				return false;
			} )
			.reply( 200 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint.isDone() ).toBeTruthy();
	} );

	it( 'sends data to the VAT endpoint with Northern Ireland country code when completing the step if the XI box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const countryCode = 'GB';
		const mockVatEndpoint = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/vat-info', ( body ) => {
				if ( body.id === vatId && body.name === vatName && body.country === 'XI' ) {
					return true;
				}
				return false;
			} )
			.reply( 200 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.click( await screen.findByLabelText( 'Is the VAT for Northern Ireland?' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint.isDone() ).toBeTruthy();
	} );

	it( 'does not send data to the VAT endpoint when completing the step if the box is not checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const countryCode = 'GB';
		const mockVatEndpoint = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/vat-info', ( body ) => {
				if ( body.id === vatId && body.name === vatName && body.country === countryCode ) {
					return true;
				}
				return false;
			} )
			.reply( 200 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );

		// Uncheck the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		await user.click( screen.getByText( 'Continue' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint.isDone() ).toBeFalsy();
	} );

	it( 'does not complete the step if the VAT endpoint returns an error', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const countryCode = 'GB';
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/me/vat-info' ).reply( 400 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT Number' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.click( screen.getByText( 'Continue' ) );
		await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();
	} );
} );
