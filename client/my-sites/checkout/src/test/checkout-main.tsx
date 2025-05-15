/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from '@automattic/calypso-products';
import { ResponseCart } from '@automattic/shopping-cart';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { navigate } from 'calypso/lib/navigate';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { errorNotice } from 'calypso/state/notices/actions';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import {
	domainProduct,
	planWithoutDomain,
	planWithoutDomainMonthly,
	mockSetCartEndpointWith,
	getActivePersonalPlanDataForType,
	countryList,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetPaymentMethodsEndpoint,
	mockGetVatInfoEndpoint,
	mockGetSupportedCountriesEndpoint,
	mockLogStashEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );
jest.mock( 'calypso/state/notices/actions' );

describe( 'CheckoutMain', () => {
	const initialCart = getBasicCart();
	const mainCartKey = 123456;

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		jest.clearAllMocks();
		( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		( errorNotice as jest.Mock ).mockImplementation( ( value ) => {
			return {
				type: 'errorNotice',
				value,
			};
		} );
		( hasLoadedSiteDomains as jest.Mock ).mockImplementation( () => true );
		( getDomainsBySiteId as jest.Mock ).mockImplementation( () => [] );
		( isMarketplaceProduct as jest.Mock ).mockImplementation( () => false );
		( isJetpackSite as jest.Mock ).mockImplementation( () => false );
		( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );

		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetVatInfoEndpoint( {} );
		mockGetSupportedCountriesEndpoint( countryList );
		mockMatchMediaOnWindow();
	} );

	it( 'renders the line items with prices', async () => {
		render( <MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } /> );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'renders the line items with prices when logged-out', async () => {
		const cartChanges = { products: [] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				cartChanges={ cartChanges }
				useUndefinedSiteId
				additionalProps={ {
					isLoggedOutCart: true,
					productAliasFromUrl: 'personal',
					sitelessCheckoutType: 'jetpack',
				} }
			/>
		);
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'renders the tax amount', async () => {
		render( <MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } /> );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Tax' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$7' ) );
		} );
	} );

	it( 'renders the total estimated amount when no billing info has been added', async () => {
		render( <MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } /> );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Total' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$156' ) );
		} );
	} );

	it( 'renders the total amount when billing info has been added', async () => {
		const cart: ResponseCart = {
			...initialCart,
			tax: {
				display_taxes: true,
				location: {
					country_code: 'US',
					postal_code: '90210',
				},
			},
		};
		render( <MockCheckout initialCart={ cart } setCart={ mockSetCartEndpoint } /> );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Total' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$156' ) );
		} );
	} );

	it( 'renders the checkout summary', async () => {
		render( <MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } /> );
		expect( await screen.findByText( 'Purchase Details' ) ).toBeInTheDocument();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'removes a product from the cart after clicking to remove it', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		const user = userEvent.setup();
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 1 );
		await user.click( removeProductButton );
		await waitFor( async () => {
			expect( screen.queryByLabelText( 'WordPress.com Personal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'redirects to the plans page if the cart is empty after removing the last product', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		const user = userEvent.setup();
		await user.click( removeProductButton );
		await waitFor( () => {
			expect( navigate ).toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page after removing a product when it is not the last', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		const user = userEvent.setup();
		await user.click( removeProductButton );
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does show the option to restore a removed product', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		const user = userEvent.setup();
		await user.click( removeProductButton );

		const restoreButton = await screen.findByText( 'Restore' );
		expect( restoreButton ).toBeInTheDocument();
	} );

	it( 'does restore a removed product when clicking on the `Restore` button', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		const user = userEvent.setup();
		await user.click( removeProductButton );

		const restoreButton = await screen.findByText( 'Restore' );
		expect( screen.queryByLabelText( 'foo.cash' ) ).not.toBeInTheDocument();

		await user.click( restoreButton );

		const restoredItem = await screen.findByLabelText( 'foo.cash' );
		expect( restoredItem ).toBeInTheDocument();
	} );

	it( 'does not redirect to the plans page if the cart is empty when it loads', async () => {
		const cartChanges = { products: [] };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalled();
		} );
	} );

	it( 'adds the aliased plan to the cart when the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'adds the product to the cart when the url has a jetpack product', async () => {
		( isJetpackSite as jest.Mock ).mockImplementation( () => true );
		( isAtomicSite as jest.Mock ).mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Jetpack Scan Daily' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$41' ) );
		} );
	} );

	it( 'adds two products to the cart when the url has two jetpack products', async () => {
		( isJetpackSite as jest.Mock ).mockImplementation( () => true );
		( isAtomicSite as jest.Mock ).mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan,jetpack_backup_daily' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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

	it( 'adds the product to the siteless cart when the url has an akismet product', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'ak_plus_yearly_1',
			sitelessCheckoutType: 'akismet' as SitelessCheckoutType,
			isNoSiteCart: true,
		};

		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);

		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Akismet Plus (10K requests/month)' )
				.map( ( element ) => expect( element ).toHaveTextContent( '$100' ) );
		} );
	} );

	it( 'adds second product when the url has two akismet products', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'ak_plus_yearly_1,ak_plus_yearly_2',
			sitelessCheckoutType: 'akismet' as SitelessCheckoutType,
			isNoSiteCart: true,
		};

		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);

		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Akismet Plus (20K requests/month)' )
				.map( ( element ) => expect( element ).toHaveTextContent( '$200' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a concierge session', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		await act( async () => {
			render(
				<MockCheckout
					initialCart={ initialCart }
					setCart={ mockSetCartEndpoint }
					cartChanges={ cartChanges }
					additionalProps={ additionalProps }
				/>
			);
		} );
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a concierge session', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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
				<MockCheckout
					initialCart={ initialCart }
					setCart={ mockSetCartEndpoint }
					cartChanges={ cartChanges }
					additionalProps={ additionalProps }
				/>
			);
		} );
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'adds the theme product to the cart when the url has a theme', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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

	it( 'adds the product quantity and domain to the cart when the url has a product with a quantity', async () => {
		const domainName = 'example.com';
		const quantity = 12;
		const productSlug = GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
		const additionalProps = {
			productAliasFromUrl: `${ productSlug }:${ domainName }:-q-${ quantity }`,
		};
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				additionalProps={ additionalProps }
			/>
		);
		expect(
			await screen.findByLabelText(
				`Google Workspace for '${ domainName }' and quantity '${ quantity }'`
			)
		).toBeInTheDocument();
	} );

	it( 'adds the product quantity to the cart when the url has a product with a quantity but no domain', async () => {
		const quantity = 12;
		const productSlug = GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
		const additionalProps = {
			productAliasFromUrl: `${ productSlug }:-q-${ quantity }`,
		};
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				additionalProps={ additionalProps }
			/>
		);
		expect(
			await screen.findByLabelText( `Google Workspace for '' and quantity '${ quantity }'` )
		).toBeInTheDocument();
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a domain map', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		await act( async () => {
			render(
				<MockCheckout
					initialCart={ initialCart }
					setCart={ mockSetCartEndpoint }
					cartChanges={ cartChanges }
					additionalProps={ additionalProps }
				/>
			);
		} );
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a domain map', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'foo.cash' ) ).toHaveLength( 3 );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain mapping', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_map:bar.com', purchaseId: '12345' };
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 3 );
		} );
	} );

	it( 'adds renewal products to the cart when the url has multiple renewals', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'domain_map:bar.com,domain_reg:bar.com',
			purchaseId: '12345,54321',
		};
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
		);
		await waitFor( () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 1 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 6 );
		} );
	} );

	it( 'displays an error and empties the cart when the url has a renewal but no site', async () => {
		const cartChanges = { products: [ planWithoutDomainMonthly ] };
		const additionalProps = {
			productAliasFromUrl: 'personal-bundle',
			purchaseId: '12345',
			siteId: 0,
		};

		( useCartKey as jest.Mock ).mockImplementation( () => 'no-site' );
		render(
			<MockCheckout
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
			/>
		);
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalled();
		} );
		await waitFor( async () => {
			expect( await screen.findByText( /You have no items in your cart/ ) ).toBeInTheDocument();
		} );

		// Noticing the error message is a little difficult because we are not
		// mounting the error display components. Instead, we spy on the
		// `errorNotice` action creator. However, `CheckoutMain` does not pass the
		// raw error message string to the action creator; it passes an array of
		// React components, one of which contains the string. The following code
		// lets us verify that.
		expect( errorNotice ).toHaveBeenCalledWith(
			expect.arrayContaining( [
				expect.objectContaining( {
					props: expect.objectContaining( {
						children: expect.stringMatching( /This renewal is invalid/ ),
					} ),
				} ),
			] )
		);
	} );

	it( 'adds the product to the cart for a gift renewal', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'personal-bundle',
			purchaseId: '12345',
			siteId: 0,
			siteSlug: 'no-site',
			couponCode: null,
			isLoggedOutCart: false,
			isNoSiteCart: false,
			isGiftPurchase: true,
		};

		( useCartKey as jest.Mock ).mockImplementation( () => 'no-site' );
		render(
			<MockCheckout
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
			/>
		);
		await waitFor( async () => {
			expect( navigate ).not.toHaveBeenCalled();
		} );
		expect(
			await screen.findByText( /WordPress.com Personal/, {
				ignore: '.cost-overrides-list-product__title',
			} )
		).toBeInTheDocument();
		// There are two versions of the "Gift" label: one shown at small width and one at wide width.
		expect( ( await screen.findAllByText( 'Gift' ) ).length ).toBeGreaterThan( 0 );
		expect( errorNotice ).not.toHaveBeenCalled();
	} );

	it( 'adds the coupon to the cart when the url has a coupon code', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = {
			couponCode: 'MYCOUPONCODE',
			coupon_savings_total_integer: 10,
		};
		render(
			<MockCheckout
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
				additionalProps={ additionalProps }
			/>
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
		( useCartKey as jest.Mock ).mockImplementation( () => undefined );
		await act( async () => {
			render( <MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } /> );
		} );
		expect( screen.getByText( 'Loading checkout' ) ).toBeInTheDocument();
	} );
} );
