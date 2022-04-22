/**
 * @jest-environment jsdom
 */
import {
	ShoppingCartProvider,
	useShoppingCart,
	createShoppingCartManagerClient,
	getEmptyResponseCart,
} from '@automattic/shopping-cart';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { Provider as ReduxProvider } from 'react-redux';
import useCachedDomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/hooks/use-cached-domain-contact-details';
import { useWpcomStore } from 'calypso/my-sites/checkout/composite-checkout/hooks/wpcom-store';
import {
	countryList,
	createTestReduxStore,
	mockGetCartEndpointWith,
	mockSetCartEndpointWith,
	mockCachedContactDetailsEndpoint,
	verifyThatTextNeverAppears,
} from './util';
import type { CountryListItem, ManagedContactDetails } from '@automattic/wpcom-checkout';

const initialCart = getEmptyResponseCart();
const getCart = mockGetCartEndpointWith( initialCart );
const setCart = mockSetCartEndpointWith( initialCart );
const cartManagerClient = createShoppingCartManagerClient( { getCart, setCart } );
const reduxStore = createTestReduxStore();

function MyTestWrapper( { countries }: { countries: CountryListItem[] } ) {
	return (
		<ReduxProvider store={ reduxStore }>
			<ShoppingCartProvider managerClient={ cartManagerClient }>
				<MyTestContent countries={ countries } />
			</ShoppingCartProvider>
		</ReduxProvider>
	);
}

function MyTestContent( { countries }: { countries: CountryListItem[] } ) {
	useWpcomStore();
	const { responseCart } = useShoppingCart( initialCart.cart_key );
	useCachedDomainContactDetails( countries );
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	return (
		<div>
			<div>Test content</div>
			{ responseCart.tax.location.country_code && (
				<div>Tax Country: { responseCart.tax.location.country_code }</div>
			) }
			{ responseCart.tax.location.postal_code && (
				<div>Tax Postal: { responseCart.tax.location.postal_code }</div>
			) }
			{ contactInfo.countryCode?.value && (
				<div>Form Country: { contactInfo.countryCode?.value }</div>
			) }
			{ contactInfo.postalCode?.value && <div>Form Postal: { contactInfo.postalCode?.value }</div> }
		</div>
	);
}

describe( 'useCachedDomainContactDetails', () => {
	it( 'sends the postal code and country from the contact details endpoint to the cart for country with postal code', async () => {
		const countryCode = 'US';
		const postalCode = '10001';
		mockCachedContactDetailsEndpoint( {
			country_code: countryCode,
			postal_code: postalCode,
		} );
		render( <MyTestWrapper countries={ countryList } /> );
		await waitFor( () => {
			expect( screen.queryByText( `Tax Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Tax Postal: ${ postalCode }` ) ).toBeInTheDocument();
		} );
	} );

	it( 'sends the country from the contact details endpoint to the cart for country without postal code', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'CW',
			postal_code: '10001',
		} );
		render( <MyTestWrapper countries={ countryList } /> );
		await waitFor( () => {
			expect( screen.queryByText( `Tax Country: CW` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Tax Postal: 10001` ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not send the country from the contact details endpoint to the cart if countries have not loaded', async () => {
		mockCachedContactDetailsEndpoint( {
			country_code: 'US',
			postal_code: '10001',
		} );
		render( <MyTestWrapper countries={ [] } /> );
		await verifyThatTextNeverAppears( 'Tax Country: US' );
		await verifyThatTextNeverAppears( 'Tax Postal: 10001' );
		await waitFor( () => {
			expect( screen.queryByText( 'Test content' ) ).toBeInTheDocument();
		} );
	} );

	it( 'sends the postal code and country from the contact details endpoint to the checkout data store for country with postal code', async () => {
		const countryCode = 'US';
		const postalCode = '10001';
		mockCachedContactDetailsEndpoint( {
			country_code: countryCode,
			postal_code: postalCode,
		} );
		render( <MyTestWrapper countries={ countryList } /> );
		await waitFor( () => {
			expect( screen.queryByText( `Form Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Form Postal: ${ postalCode }` ) ).toBeInTheDocument();
		} );
	} );

	it( 'sends the country from the contact details endpoint to the checkout data store for country without postal code', async () => {
		const countryCode = 'CW';
		const postalCode = '10001';
		mockCachedContactDetailsEndpoint( {
			country_code: countryCode,
			postal_code: postalCode,
		} );
		render( <MyTestWrapper countries={ countryList } /> );
		await waitFor( () => {
			expect( screen.queryByText( `Form Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Form Postal: ${ postalCode }` ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not send the country from the contact details endpoint to the checkout data store if countries have not loaded', async () => {
		const countryCode = 'US';
		const postalCode = '10001';
		mockCachedContactDetailsEndpoint( {
			country_code: countryCode,
			postal_code: postalCode,
		} );
		render( <MyTestWrapper countries={ [] } /> );
		await verifyThatTextNeverAppears( 'Form Country: US' );
		await verifyThatTextNeverAppears( 'Form Postal: 10001' );
		await waitFor( () => {
			expect( screen.queryByText( 'Test content' ) ).toBeInTheDocument();
		} );
	} );
} );
