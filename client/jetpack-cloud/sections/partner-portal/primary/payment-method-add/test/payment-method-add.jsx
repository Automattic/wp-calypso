/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
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

		render(
			<Provider store={ store }>
				<PaymentMethodAdd />
			</Provider>
		);

		expect( document.body ).toMatchSnapshot();

		await act( () => promise );
	} );
} );
