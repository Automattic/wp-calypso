/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { convertResponseCartToRequestCart } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
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
	domainProduct,
	planWithBundledDomain,
	planWithoutDomain,
	mockSetCartEndpointWith,
	mockCachedContactDetailsEndpoint,
	getActivePersonalPlanDataForType,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
	mockSetVatInfoEndpoint,
	countryList,
	mockGetPaymentMethodsEndpoint,
	mockLogStashEndpoint,
	mockGetSupportedCountriesEndpoint,
	gSuiteProduct,
	mockSetCachedContactDetailsEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { CartKey, ResponseCartProduct } from '@automattic/shopping-cart';
import type { ContactDetailsType } from '@automattic/wpcom-checkout';

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

type TestProductType = 'google workspace' | 'plan' | 'plan with domain';

describe( 'Checkout contact step extra tax fields', () => {
	const mainCartKey: CartKey = 'foo.com' as CartKey;
	const initialCart = getBasicCart();
	const defaultPropsForMockCheckout = {
		initialCart,
	};

	( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	hasLoadedSiteDomains.mockImplementation( () => true );
	getDomainsBySiteId.mockImplementation( () => [] );
	isMarketplaceProduct.mockImplementation( () => false );
	isJetpackSite.mockImplementation( () => false );
	mockMatchMediaOnWindow();

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );
		nock.cleanAll();
		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetVatInfoEndpoint( {} );
		mockSetCachedContactDetailsEndpoint();
		mockCachedContactDetailsEndpoint( {} );
		mockGetVatInfoEndpoint( {} );
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
			product: 'google workspace',
			expect: 'city and province',
		},
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
			tax: { country_code: 'CH', address: 'CH Address', postal_code: '123-4567' },
			product: 'plan',
			expect: 'address',
		},
		{
			tax: { country_code: 'CH', address: 'CH Address', postal_code: '123-4567' },
			product: 'plan with domain',
			expect: 'address',
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
		async ( {
			tax,
			labels,
			product,
		}: {
			tax: Record< string, string >;
			labels?: Record< string, string >;
			product: string;
		} ) => {
			const getPostalCodeLabel = ( productType: TestProductType ): string => {
				if ( productType === 'plan' || productType === 'google workspace' ) {
					return 'Postal code';
				}
				return 'Postal Code';
			};
			const getContactValidationEndpointType = (
				productType: TestProductType
			): Exclude< ContactDetailsType, 'none' > => {
				if ( productType === 'plan' ) {
					return 'tax';
				}
				if ( productType === 'plan with domain' ) {
					return 'domain';
				}
				if ( productType === 'google workspace' ) {
					return 'gsuite';
				}
				throw new Error( `Unknown product type '${ productType }'` );
			};
			const getCartProducts = ( productType: TestProductType ): ResponseCartProduct[] => {
				if ( productType === 'plan' ) {
					return [ planWithoutDomain ];
				}
				if ( productType === 'plan with domain' ) {
					return [ planWithBundledDomain, domainProduct ];
				}
				if ( productType === 'google workspace' ) {
					return [ gSuiteProduct ];
				}
				throw new Error( `Unknown product type '${ productType }'` );
			};

			const selects = { country_code: true, subdivision_code: true };
			labels = {
				city: 'City',
				subdivision_code: 'State',
				organization: 'Organization',
				postal_code: getPostalCodeLabel( product as TestProductType ),
				country_code: 'Country',
				address: 'Address',
				...labels,
			};
			mockContactDetailsValidationEndpoint(
				getContactValidationEndpointType( product as TestProductType ),
				{
					success: true,
				}
			);
			const user = userEvent.setup();
			const cartChanges = { products: getCartProducts( product as TestProductType ) };

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
					if ( ! labels[ key ] ) {
						throw new Error( `There is a missing label for the key "${ key }".` );
					}
					await user.type( await screen.findByLabelText( labels[ key ] ), tax[ key ] );
				}
			}

			await user.click( screen.getByText( 'Continue to payment' ) );
			expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			expect( setCart ).toHaveBeenCalledWith(
				mainCartKey,
				convertResponseCartToRequestCart( {
					...initialCart,
					...cartChanges,
					tax: {
						display_taxes: true,
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
			await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
			if ( vatOrganization === 'with' ) {
				await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
			}
			await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

			await user.click( screen.getByText( 'Continue to payment' ) );
			expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			expect( setCart ).toHaveBeenCalledWith(
				mainCartKey,
				convertResponseCartToRequestCart( {
					...initialCart,
					...cartChanges,
					tax: {
						display_taxes: true,
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

	it.each( [
		{ withVatAddress: 'with', product: 'plan' },
		{ withVatAddress: 'without', product: 'plan' },
		{ withVatAddress: 'with', product: 'plan with domain' },
		{ withVatAddress: 'without', product: 'plan with domain' },
	] )(
		'sends both contact details and tax data to the shopping cart endpoint when a plan with domain is in the cart and VAT details have been added $withVatAddress VAT address',
		async ( { withVatAddress, product } ) => {
			const vatId = '12345';
			const vatAddress = withVatAddress === 'with' ? 'VAT Address' : 'Contact Address';
			const countryCode = 'CH';
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
			await user.type( await screen.findByLabelText( 'Address' ), 'Contact Address' );

			// Check the box
			await user.click( await screen.findByLabelText( 'Add GST details' ) );

			// Fill in the details
			await user.type( await screen.findByLabelText( 'GST ID' ), vatId );
			if ( withVatAddress === 'with' ) {
				await user.type( await screen.findByLabelText( 'Address for GST' ), vatAddress );
			}

			await user.click( screen.getByText( 'Continue to payment' ) );
			expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
			expect( setCart ).toHaveBeenCalledWith(
				mainCartKey,
				convertResponseCartToRequestCart( {
					...initialCart,
					...cartChanges,
					tax: {
						display_taxes: true,
						location: {
							country_code: countryCode,
							postal_code: postalCode,
							vat_id: vatId,
							address: vatAddress,
						},
					},
				} )
			);
		}
	);
} );
