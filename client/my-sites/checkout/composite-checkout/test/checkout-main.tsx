/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { render, fireEvent, screen, within, waitFor, act } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { navigate } from 'calypso/lib/navigate';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CheckoutMain from '../components/checkout-main';
import {
	siteId,
	domainProduct,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	createTestReduxStore,
	countryList,
	getBasicCart,
	mockMatchMediaOnWindow,
} from './util';
import type { ResponseCart } from '@automattic/shopping-cart';

/* eslint-disable jest/no-conditional-expect */

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'CheckoutMain', () => {
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
		const queryClient = new QueryClient();

		MyCheckout = ( {
			cartChanges,
			additionalProps,
			additionalCartProps,
			useUndefinedCartKey,
		}: {
			cartChanges: Partial< ResponseCart >;
			additionalProps: Partial< Parameters< typeof CheckoutMain > >;
			additionalCartProps: Partial< Parameters< typeof ShoppingCartProvider > >;
			useUndefinedCartKey?: boolean;
		} ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			const mainCartKey = 123456;
			useCartKey.mockImplementation( () => ( useUndefinedCartKey ? undefined : mainCartKey ) );
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/vat-info' ).reply( 200, {} );
			mockMatchMediaOnWindow();
			return (
				<ReduxProvider store={ store }>
					<QueryClientProvider client={ queryClient }>
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

	it( 'removes a product from the cart after clicking to remove it', async () => {
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
		await waitFor( async () => {
			expect( screen.queryByLabelText( 'WordPress.com Personal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'redirects to the plans page if the cart is empty after removing the last product', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( navigate ).toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty after removing a product when it is not the last', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty when it loads', async () => {
		const cartChanges = { products: [] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalledWith( '/plans/foo.com' );
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
			expect( navigate ).not.toHaveBeenCalled();
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
		expect( navigate ).not.toHaveBeenCalled();
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
		expect( navigate ).not.toHaveBeenCalled();
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
		expect( navigate ).not.toHaveBeenCalled();
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
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 1 );
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
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'foo.cash' ) ).toHaveLength( 2 );
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
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 1 );
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
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 4 );
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
