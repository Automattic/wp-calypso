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
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import useCachedDomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/hooks/use-cached-domain-contact-details';
import { useWpcomStore } from 'calypso/my-sites/checkout/composite-checkout/hooks/wpcom-store';
import {
	countryList,
	createTestReduxStore,
	mockGetCartEndpointWith,
	mockSetCartEndpointWith,
} from './util';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

const initialCart = getEmptyResponseCart();
const getCart = mockGetCartEndpointWith( initialCart );
const setCart = mockSetCartEndpointWith( initialCart );
const cartManagerClient = createShoppingCartManagerClient( { getCart, setCart } );
const reduxStore = createTestReduxStore();

function MyTestWrapper() {
	return (
		<ReduxProvider store={ reduxStore }>
			<ShoppingCartProvider managerClient={ cartManagerClient }>
				<MyTestContent />
			</ShoppingCartProvider>
		</ReduxProvider>
	);
}

function mockCachedContactDetailsEndpoint( data ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );
	const mockDomainContactResponse = () => [ 200, data ];
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/domain-contact-information' )
		.reply( mockDomainContactResponse );
}

function MyTestContent() {
	useWpcomStore();
	const { responseCart } = useShoppingCart( initialCart.cart_key );
	useCachedDomainContactDetails( countryList );
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	return (
		<div>
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
		render( <MyTestWrapper /> );
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
		render( <MyTestWrapper /> );
		await waitFor( () => {
			expect( screen.queryByText( `Tax Country: CW` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Tax Postal:` ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'sends the postal code and country from the contact details endpoint to the checkout data store for country with postal code', async () => {
		const countryCode = 'US';
		const postalCode = '10001';
		mockCachedContactDetailsEndpoint( {
			country_code: countryCode,
			postal_code: postalCode,
		} );
		render( <MyTestWrapper /> );
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
		render( <MyTestWrapper /> );
		await waitFor( () => {
			expect( screen.queryByText( `Form Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Form Postal: ${ postalCode }` ) ).not.toBeInTheDocument();
		} );
	} );
} );
