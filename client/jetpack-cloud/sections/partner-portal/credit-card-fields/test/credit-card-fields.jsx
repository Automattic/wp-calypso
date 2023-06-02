/**
 * @jest-environment jsdom
 */
import { checkoutTheme } from '@automattic/composite-checkout';
import { ThemeProvider } from '@emotion/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { render } from '@testing-library/react';
import { useSelect, useDispatch } from '@wordpress/data';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CreditCardFields from '../index';

const mockUseSelector = () => () => null;

jest.mock( '@stripe/stripe-js', () => ( {
	loadStripe: () => null,
} ) );

jest.mock( '@wordpress/data' );

jest.mock( '../set-as-primary-payment-method', () => {
	const component = jest.requireActual( '../set-as-primary-payment-method' ).default;
	const paymentMethodComponent = ( args ) => {
		const props = {
			...args,
			isChecked: true,
			isDisabled: true,
			onChange: jest.fn(),
		};
		return component( props );
	};
	return paymentMethodComponent;
} );

jest.mock( 'calypso/jetpack-cloud/sections/partner-portal/hooks', () => {
	const items = jest.requireActual( 'calypso/jetpack-cloud/sections/partner-portal/hooks' );
	return {
		...items,
		useRecentPaymentMethodsQuery: () => {
			return {
				data: [],
				isFetching: false,
			};
		},
	};
} );

describe( '<CreditCardFields>', () => {
	beforeEach( () => {
		// Re-mock dependencies
		jest.clearAllMocks();
		useDispatch.mockImplementation( mockUseSelector );
		useSelect.mockImplementation( mockUseSelector );
	} );

	afterEach( () => {
		useDispatch.mockClear();
		useSelect.mockClear();
	} );

	test( 'should render correctly and card name field should exist', async () => {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const stripeConfiguration = { public_key: 'test', js_url: 'test', processor_id: '1234' };

		const stripe = await loadStripe( stripeConfiguration.public_key, {
			locale: 'en',
		} );

		const { container } = render(
			<Provider store={ store }>
				<Elements stripe={ stripe }>
					<ThemeProvider theme={ checkoutTheme }>
						<CreditCardFields />
					</ThemeProvider>
				</Elements>
			</Provider>
		);

		expect( container.querySelector( '#cardholder-name' ) ).toBeInTheDocument();
	} );
} );
