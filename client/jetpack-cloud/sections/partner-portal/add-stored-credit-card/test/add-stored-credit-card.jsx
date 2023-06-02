/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AddStoredCreditCard from '../index';

describe( '<AddStoredCreditCard>', () => {
	test( 'should render correctly and have an a tag with href', () => {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const { container } = render(
			<Provider store={ store }>
				<AddStoredCreditCard />
			</Provider>
		);

		const [ aTag ] = container.getElementsByClassName( 'add-stored-credit-card' );
		const href = 'https://example.com/partner-portal/payment-methods/add';

		expect( aTag ).toHaveProperty( 'href', href );
	} );
} );
