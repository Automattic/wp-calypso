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
	return (
		<div>
			<div>Country: { responseCart.tax.location.country_code }</div>
			<div>Postal: { responseCart.tax.location.postal_code }</div>
		</div>
	);
}

describe( 'useCachedDomainContactDetails', () => {
	it( 'sends the postal code and country from the contact details endpoint to the cart', async () => {
		mockCachedContactDetailsEndpoint();
		render( <MyTestWrapper /> );
		await waitFor( () => {
			expect( screen.queryByText( `Country: ${ countryCode }` ) ).toBeInTheDocument();
			expect( screen.queryByText( `Postal: ${ postalCode }` ) ).toBeInTheDocument();
		} );
	} );
} );
