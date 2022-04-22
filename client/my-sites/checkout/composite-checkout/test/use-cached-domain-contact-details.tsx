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

const countryCode = 'US';
const postalCode = '10001';
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

function mockCachedContactDetailsEndpoint() {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );
	const mockDomainContactResponse = () => [
		200,
		{ country_code: countryCode, postal_code: postalCode },
	];
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/domain-contact-information' )
		.reply( mockDomainContactResponse )
		.persist();
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
			<div>Tax Country: { responseCart.tax.location.country_code }</div>
			<div>Tax Postal: { responseCart.tax.location.postal_code }</div>
			<div>Form Country: { contactInfo.countryCode?.value }</div>
			<div>Form Postal: { contactInfo.postalCode?.value }</div>
		</div>
	);
}

describe( 'useCachedDomainContactDetails', () => {
	it( 'sends the postal code and country from the contact details endpoint to the cart', async () => {
		mockCachedContactDetailsEndpoint();
		render( <MyTestWrapper /> );
		await waitFor( () => {
			expect( screen.queryByText( `Tax Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Tax Postal: ${ postalCode }` ) ).toBeInTheDocument();
		} );
	} );

	it( 'sends the postal code and country from the contact details endpoint to the checkout data store', async () => {
		mockCachedContactDetailsEndpoint();
		render( <MyTestWrapper /> );
		await waitFor( () => {
			expect( screen.queryByText( `Form Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Form Postal: ${ postalCode }` ) ).toBeInTheDocument();
		} );
	} );
} );
