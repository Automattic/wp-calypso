/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SetAsPrimaryPaymentMethod from '../set-as-primary-payment-method';

describe( '<SetAsPrimaryPaymentMethod>', () => {
	test( 'should render correctly, and fire change event correctly', async () => {
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

		const input = screen.getByRole( 'checkbox' );

		expect( input ).toBeChecked();

		await userEvent.click( input );

		expect( props.onChange ).toHaveBeenCalledTimes( 1 );
		expect( props.onChange ).toHaveBeenCalledWith( false );
	} );
} );
