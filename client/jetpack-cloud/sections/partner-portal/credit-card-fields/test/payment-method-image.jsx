/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PaymentMethodImage from '../payment-method-image';

describe( '<PaymentMethodImage>', () => {
	test( 'should render correctly and match the snapshot', () => {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<PaymentMethodImage />
			</Provider>
		);

		expect( document.body ).toMatchSnapshot();
	} );
} );
