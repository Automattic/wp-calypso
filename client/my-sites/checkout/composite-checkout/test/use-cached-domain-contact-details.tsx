/**
 * @jest-environment jsdom
 */
import {
	ShoppingCartProvider,
	useShoppingCart,
	createShoppingCartManagerClient,
	getEmptyResponseCart,
} from '@automattic/shopping-cart';
import { render, screen, waitFor } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import useCachedDomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/hooks/use-cached-domain-contact-details';
import { useWpcomStore } from 'calypso/my-sites/checkout/composite-checkout/hooks/wpcom-store';
import {
	countryList,
	createTestReduxStore,
	mockCartEndpoint,
	mockCachedContactDetailsEndpoint,
} from './util';
import type { CountryListItem, ManagedContactDetails } from '@automattic/wpcom-checkout';

const initialCart = getEmptyResponseCart();
const { getCart, setCart } = mockCartEndpoint( initialCart, 'USD', 'US' );
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
	const { responseCart, reloadFromServer, updateLocation } = useShoppingCart(
		initialCart.cart_key
	);
	useCachedDomainContactDetails( countries );
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	const [ localLocation, setLocation ] = useState( { countryCode: '', postalCode: '' } );
	const onChangeCountry = ( evt ) => {
		const newVal = evt.target.value;
		setLocation( ( prev ) => ( { ...prev, countryCode: newVal } ) );
	};
	const onChangePostal = ( evt ) => {
		const newVal = evt.target.value;
		setLocation( ( prev ) => ( { ...prev, postalCode: newVal } ) );
	};

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

			<div>
				<label htmlFor="country">Country</label>
				<input id="country" value={ localLocation.countryCode } onChange={ onChangeCountry } />
			</div>
			<div>
				<label htmlFor="postal">Postal</label>
				<input id="postal" value={ localLocation.postalCode } onChange={ onChangePostal } />
			</div>
			<button onClick={ () => updateLocation( localLocation ) }>
				Click to set cart tax location
			</button>
			<button onClick={ reloadFromServer }>Click to reload cart</button>
		</div>
	);
}

describe( 'useCachedDomainContactDetails', () => {
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
		await expect( screen.findByText( 'Form Country: US' ) ).toNeverAppear();
		await expect( screen.findByText( 'Form Postal: 10001' ) ).toNeverAppear();
	} );
} );
