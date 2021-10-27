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
	act,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import nock from 'nock';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CompositeCheckout from '../composite-checkout';
import {
	siteId,
	domainProduct,
	domainTransferProduct,
	planWithBundledDomain,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpoint,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	getPersonalPlanForInterval,
	getBusinessPlanForInterval,
	getVariantItemTextForInterval,
	getPlansItemsState,
	createTestReduxStore,
	countryList,
	gSuiteProduct,
	caDomainProduct,
} from './util';

/* eslint-disable jest/no-conditional-expect */

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

describe( 'CompositeCheckout', () => {
	let container;
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const initialCart = {
			coupon: '',
			coupon_savings_total: 0,
			coupon_savings_total_integer: 0,
			coupon_savings_total_display: '0',
			currency: 'BRL',
			locale: 'br-pt',
			is_coupon_applied: false,
			products: [ planWithoutDomain ],
			tax: {
				display_taxes: true,
				location: {},
			},
			temporary: false,
			allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
			savings_total_integer: 0,
			savings_total_display: 'R$0',
			total_tax_integer: 700,
			total_tax_display: 'R$7',
			total_cost_integer: 15600,
			total_cost_display: 'R$156',
			sub_total_integer: 15600,
			sub_total_display: 'R$156',
			coupon_discounts_integer: [],
		};

		const store = createTestReduxStore();

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps, useUndefinedCartKey } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			const mainCartKey = 'foo.com';
			useCartKey.mockImplementation( () => ( useUndefinedCartKey ? undefined : mainCartKey ) );
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
							<CompositeCheckout
								siteId={ siteId }
								siteSlug={ 'foo.com' }
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

	it( 'renders the line items with prices', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'renders the tax amount', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Tax' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$7' ) );
		} );
	} );

	it( 'renders the total amount', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Total' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$156' ) );
		} );
	} );

	it( 'renders the paypal payment method option', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when no credits are available', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the paypal payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the full credits payment method option when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( /WordPress.com Credits:/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the other payment method options when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the free payment method option when the purchase is not free', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'Free Purchase' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the paypal payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when full credits are available but the purchase is free', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			total_tax_integer: 0,
			total_tax_display: 'R$0',
			total_cost_integer: 0,
			total_cost_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the free payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Free Purchase' ) ).toBeInTheDocument();
		} );
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

	it( 'does not complete the contact step when the contact step button has not been clicked', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
		} );
		expect( screen.queryByTestId( 'payment-method-step--visible' ) ).not.toBeInTheDocument();
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
			const endpointPath = ( () => {
				switch ( name ) {
					case 'plan':
						return '/rest/v1.1/me/tax-contact-information/validate';
					case 'domain':
						return '/rest/v1.2/me/domain-contact-information/validate';
					case 'gsuite':
						return '/rest/v1.1/me/google-apps/validate';
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
			nock( 'https://public-api.wordpress.com' )
				.post( endpointPath, ( body ) => {
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
				} )
				.reply( 200, {
					success: valid === 'valid',
					messages,
				} );
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
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

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
			await waitForElementToBeRemoved( () => screen.queryByText( 'Updating cart…' ) );

			if ( complete === 'does' ) {
				expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			} else {
				// This is a little tricky because we need to verify something never happens,
				// even after some time passes, so we use this slightly convoluted technique:
				// https://stackoverflow.com/a/68318058/2615868
				await expect( screen.findByTestId( 'payment-method-step--visible' ) ).rejects.toThrow();
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
			expect( page.redirect ).not.toHaveBeenCalled();
		} );
	} );

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'yearly' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'two-year' },
	] )(
		'renders the variant picker with $expectedVariant for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect(
				screen.getByText( getVariantItemTextForInterval( expectedVariant ) )
			).toBeInTheDocument();
		}
	);

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'renders the variant picker without $expectedVariant for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect(
				screen.queryByText( getVariantItemTextForInterval( expectedVariant ) )
			).not.toBeInTheDocument();
		}
	);

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'renders the $expectedVariant variant with a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			const variantItem = screen
				.getByText( getVariantItemTextForInterval( expectedVariant ) )
				.closest( 'label' );
			const lowestVariantItem = variantItem.closest( 'ul' ).querySelector( 'label:first-of-type' );
			const lowestVariantSlug = lowestVariantItem.closest( 'div' ).querySelector( 'input' ).value;
			const variantSlug = variantItem.closest( 'div' ).querySelector( 'input' ).value;

			const variantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === variantSlug
			);
			const finalPrice = variantData.raw_price;
			const variantInterval = variantData.bill_period;
			const lowestVariantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === lowestVariantSlug
			);
			const lowestVariantPrice = lowestVariantData.raw_price;
			const lowestVariantInterval = lowestVariantData.bill_period;
			const intervalsInVariant = Math.round( variantInterval / lowestVariantInterval );
			const priceBeforeDiscount = lowestVariantPrice * intervalsInVariant;

			const discountPercentage = Math.round( 100 - ( finalPrice / priceBeforeDiscount ) * 100 );
			expect(
				within( variantItem ).getByText( `Save ${ discountPercentage }%` )
			).toBeInTheDocument();
		}
	);

	it.each( [ { activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' } ] )(
		'renders the $expectedVariant variant without a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			const variantItem = screen
				.getByText( getVariantItemTextForInterval( expectedVariant ) )
				.closest( 'label' );
			expect( within( variantItem ).queryByText( /Save \d+%/ ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker if there are no variants after clicking into edit mode', async () => {
		const cartChanges = { products: [ domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );

		expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'yearly' },
	] )(
		'does not render the variant picker for a term change from $activePlan to $cartPlan of the current plan',
		async ( { activePlan, cartPlan } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getPersonalPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker for a renewal of the current plan', async () => {
		const currentPlanRenewal = { ...planWithoutDomain, extra: { purchaseType: 'renewal' } };
		const cartChanges = { products: [ currentPlanRenewal ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );

		expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
	} );

	it( 'removes a product from the cart after clicking to remove it in edit mode', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 2 );
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( screen.queryAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 0 );
		} );
	} );

	it( 'removes a product from the cart after clicking to remove it outside of edit mode', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 2 );
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( async () => {
			expect( screen.queryAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 0 );
		} );
	} );

	it( 'redirects to the plans page if the cart is empty after removing the last product', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmButton = await screen.findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( page.redirect ).toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty after removing a product when it is not the last', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmButton = await screen.findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty when it loads', async () => {
		const cartChanges = { products: [] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalled();
		} );
	} );

	it( 'adds the aliased plan to the cart when the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'adds the product to the cart when the url has a jetpack product', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Jetpack Scan Daily' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$41' ) );
		} );
	} );

	it( 'adds two products to the cart when the url has two jetpack products', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan,jetpack_backup_daily' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Jetpack Scan Daily' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$41' ) );
			screen
				.getAllByLabelText( 'Jetpack Backup (Daily)' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$42' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a concierge session', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a concierge session', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Support Session' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$49' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a theme', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a theme', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Premium Theme: Ovation' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$69' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a domain map', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a domain map', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			screen
				.getAllByLabelText( 'bar.com' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$0' ) );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal-bundle', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain registration', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_reg:foo.cash', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'foo.cash' ) ).toHaveLength( 3 );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain mapping', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_map:bar.com', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 2 );
		} );
	} );

	it( 'adds renewal products to the cart when the url has multiple renewals', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'domain_map:bar.com,domain_reg:bar.com',
			purchaseId: '12345,54321',
		};
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 5 );
		} );
	} );

	it( 'adds the coupon to the cart when the url has a coupon code', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = {
			couponCode: 'MYCOUPONCODE',
			coupon_savings_total_integer: 10,
			coupon_savings_total_display: '$R10',
		};
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Coupon: MYCOUPONCODE' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$10' ) );
		} );
	} );

	it( 'displays loading while cart key is undefined (eg: when cart store has pending updates)', async () => {
		await act( async () => {
			render( <MyCheckout useUndefinedCartKey={ true } />, container );
		} );
		expect( screen.getByText( 'Loading checkout' ) ).toBeInTheDocument();
	} );
} );
