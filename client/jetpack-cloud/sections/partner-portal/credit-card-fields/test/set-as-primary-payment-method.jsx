/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SetAsPrimaryPaymentMethod from '../set-as-primary-payment-method';

describe( '<SetAsPrimaryPaymentMethod>', () => {
	test( 'should render correctly, and fire change event correctly', () => {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const props = {
			isChecked: true,
			isDisabled: false,
			onChange: jest.fn(),
		};

		const { container } = render(
			<Provider store={ store }>
				<SetAsPrimaryPaymentMethod { ...props } />
			</Provider>
		);

		const [ input ] = container.getElementsByTagName( 'input' );

		expect( input ).toBeChecked();

		fireEvent.change( input, { target: { checked: false } } );

		expect( input ).not.toBeChecked();
	} );
} );
