/**
 * @jest-environment jsdom
 */
import { CheckoutProvider, CheckoutStep, CheckoutStepGroup } from '@automattic/composite-checkout';
import {
	ShoppingCartProvider,
	useShoppingCart,
	createShoppingCartManagerClient,
	getEmptyResponseCart,
} from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useMemo, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { useExperiment } from 'calypso/lib/explat';
import { usePrefillCheckoutContactForm } from 'calypso/my-sites/checkout/src/hooks/use-prefill-checkout-contact-form';
import { CHECKOUT_STORE } from 'calypso/my-sites/checkout/src/lib/wpcom-store';
import {
	countryList,
	createTestReduxStore,
	mockCartEndpoint,
	mockCachedContactDetailsEndpoint,
} from './util';
import type { CountryListItem } from '@automattic/wpcom-checkout';

jest.mock( 'calypso/lib/explat' );
( useExperiment as jest.Mock ).mockImplementation( () => [ false, undefined ] );

const initialCart = getEmptyResponseCart();
const { getCart, setCart } = mockCartEndpoint( initialCart, 'USD', 'US' );
const cartManagerClient = createShoppingCartManagerClient( { getCart, setCart } );
const paymentMethods = [];
const paymentProcessors = {};

function MyTestWrapper( {
	countries,
	reduxStore,
}: {
	countries: CountryListItem[];
	reduxStore: ReturnType< typeof createTestReduxStore >;
} ) {
	const queryClient = useMemo( () => new QueryClient(), [] );
	return (
		<ReduxProvider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<ShoppingCartProvider managerClient={ cartManagerClient }>
					<CheckoutProvider
						paymentMethods={ paymentMethods }
						paymentProcessors={ paymentProcessors }
					>
						<CheckoutStepGroup>
							<CheckoutStep
								stepId="contact-form"
								titleContent={ <em>Contact step</em> }
								isCompleteCallback={ () => false }
								activeStepContent={ <MyTestContent countries={ countries } /> }
							/>
							<CheckoutStep
								stepId="payment-method-step"
								titleContent={ <em>Payment Method Step</em> }
								isCompleteCallback={ () => false }
							/>
							<CheckoutStep
								stepId="other-step"
								titleContent={ <em>Other step</em> }
								isCompleteCallback={ () => false }
							/>
						</CheckoutStepGroup>
					</CheckoutProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

function MyTestContent( { countries }: { countries: CountryListItem[] } ) {
	const { responseCart, reloadFromServer, updateLocation } = useShoppingCart(
		initialCart.cart_key
	);
	usePrefillCheckoutContactForm( {
		setShouldShowContactDetailsValidationErrors: () => null,
		overrideCountryList: countries,
	} );
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
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
		const reduxStore = createTestReduxStore();
		render( <MyTestWrapper countries={ countryList } reduxStore={ reduxStore } /> );
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
		const reduxStore = createTestReduxStore();
		render( <MyTestWrapper countries={ countryList } reduxStore={ reduxStore } /> );
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
		const reduxStore = createTestReduxStore();
		render( <MyTestWrapper countries={ [] } reduxStore={ reduxStore } /> );
		await expect( screen.findByText( 'Form Country: US' ) ).toNeverAppear();
		await expect( screen.findByText( 'Form Postal: 10001' ) ).toNeverAppear();
	} );
} );
