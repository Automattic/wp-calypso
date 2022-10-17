/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import {
	render,
	fireEvent,
	screen,
	within,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import nock from 'nock';
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

/* eslint-disable jest/no-conditional-expect */

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout contact step', () => {
	let container;
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		hasLoadedSiteDomains.mockImplementation( () => true );
		getDomainsBySiteId.mockImplementation( () => [] );
		isMarketplaceProduct.mockImplementation( () => false );
		isJetpackSite.mockImplementation( () => false );

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const initialCart = getBasicCart();

		const mockSetCartEndpoint = mockSetCartEndpointWith( {
			currency: initialCart.currency,
			locale: initialCart.locale,
		} );

		const store = createTestReduxStore();

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps, useUndefinedCartKey } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			const mainCartKey = 'foo.com';
			useCartKey.mockImplementation( () => ( useUndefinedCartKey ? undefined : mainCartKey ) );
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			mockMatchMediaOnWindow();
			return (
				<ReduxProvider store={ store }>
					<ShoppingCartProvider
						managerClient={ managerClient }
						options={ {
							defaultCartKey: useUndefinedCartKey ? undefined : mainCartKey,
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
				</ReduxProvider>
			);
		};
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect(
				screen.queryByText( /Enter your (billing|contact) information/ )
			).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( /Enter your (billing|contact) information/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Phone' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Address' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'City' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'State' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders country-specific domain fields when a country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'US' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Address' ) ).toBeInTheDocument();
			expect( screen.getByText( 'City' ) ).toBeInTheDocument();
			expect( screen.getByText( 'State' ) ).toBeInTheDocument();
			expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a plan is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'US' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Postal code' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a plan is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'CW' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'US' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'CW' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Postal Code' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not complete the contact step when the contact step button has not been clicked and there are no cached details', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		expect( screen.queryByTestId( 'payment-method-step--visible' ) ).not.toBeInTheDocument();
	} );

	/**
	 * TODO: Restore these tests, which were failing for some reason on #64718
	 */
	/* eslint-disable jest/no-disabled-tests */
	it.skip( 'autocompletes the contact step when there are valid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: '10001',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		// Wait for the validation to complete
		await waitForElementToBeRemoved( () => screen.queryAllByText( 'Please wait…' ) );
		expect( screen.queryByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
	} );

	it.skip( 'does not autocomplete the contact step when there are invalid cached details', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: 'ABCD',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		// Wait for the cart to load
		await screen.findByText( 'Country' );
		// Wait for the validation to complete
		await waitForElementToBeRemoved( () => screen.queryAllByText( 'Please wait…' ) );
		await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();
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
				/>,
				container
			);

			// Wait for the cart to load
			await screen.findByText( 'Country' );

			// Fill in the contact form
			if ( name === 'domain' || logged === 'out' ) {
				fireEvent.change( screen.getByLabelText( 'Email' ), {
					target: { value: validContactDetails.email },
				} );
			}
			fireEvent.change( screen.getByLabelText( 'Country' ), {
				target: { value: validContactDetails.country_code },
			} );
			fireEvent.change( screen.getByLabelText( /(Postal|ZIP) code/i ), {
				target: { value: validContactDetails.postal_code },
			} );
			fireEvent.click( await screen.findByText( 'Continue' ) );

			// Wait for the validation to complete
			await waitForElementToBeRemoved( () => screen.queryAllByText( 'Please wait…' ) );

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
		}
	);

	it( 'renders the checkout summary', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Purchase Details' ) ).toBeInTheDocument();
			expect( navigate ).not.toHaveBeenCalled();
		} );
	} );

	it( 'removes a product from the cart after clicking to remove', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 1 );
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( screen.queryByLabelText( 'WordPress.com Personal' ) ).not.toBeInTheDocument();
		} );
	} );
} );
