/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SetAsPrimaryPaymentMethod from '../set-as-primary-payment-method';

describe( '<SetAsPrimaryPaymentMethod>', () => {
	test( 'should render correctly, match the snapshot and fire change event correctly', () => {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const props = {
			isChecked: true,
			isDisabled: false,
			onChange: jest.fn(),
		};

		render(
			<Provider store={ store }>
				<SetAsPrimaryPaymentMethod { ...props } />
			</Provider>
		);

		expect( document.body ).toMatchSnapshot();

		const input = document.body.getElementsByTagName( 'input' )[ 0 ];

		expect( input ).toBeChecked();

		fireEvent.change( input, { target: { checked: false } } );

		expect( input ).not.toBeChecked();
	} );
} );
