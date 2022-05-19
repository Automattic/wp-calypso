/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PaymentMethodAdd from '../index';

describe( '<PaymentMethodAdd>', () => {
	test( 'should render correctly and match the snapshot', async () => {
		const promise = Promise.resolve();
		const initialState = {
			ui: { section: 'test' },
			documentHead: { unreadCount: 1 },
		};

		const store = createStore( ( state ) => state, initialState );

		const { container, getByText } = render(
			<Provider store={ store }>
				<PaymentMethodAdd />
			</Provider>
		);

		const [ aTag ] = container.getElementsByClassName( 'payment-method-add__back-button' );
		const href = 'https://example.com/partner-portal/payment-methods/';

		expect( aTag ).toHaveProperty( 'href', href );

		expect( getByText( 'Credit card details' ) ).toBeInTheDocument();

		await act( () => promise );
	} );
} );
