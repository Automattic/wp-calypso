/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SubscriberProfile from '../subscriber-profile';

const testName = 'Test Name';
const testEmail = 'test@test.com';
const testAvatar = 'testAvatar.jpg';

const mockStore = configureStore();
const store = mockStore( {} );

describe( 'SubscriberProfile', () => {
	it( 'renders the name and email', () => {
		render(
			<Provider store={ store }>
				<SubscriberProfile avatar={ testAvatar } displayName={ testName } email={ testEmail } />
			</Provider>
		);

		expect( screen.getByText( testName ) ).toBeInTheDocument();
		expect( screen.getByText( testEmail ) ).toBeInTheDocument();
		expect( screen.getByAltText( testName ) ).toBeInTheDocument();
	} );

	it( 'does not render the email if it is the same as the display name', () => {
		render(
			<Provider store={ store }>
				<SubscriberProfile avatar={ testAvatar } displayName={ testEmail } email={ testEmail } />
			</Provider>
		);

		expect( screen.queryByText( testEmail ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'subscriber-profile__email' ) ).toBeNull();
	} );

	it( 'does not render the email if it is not provided', () => {
		render(
			<Provider store={ store }>
				<SubscriberProfile avatar={ testAvatar } displayName={ testName } email="" />
			</Provider>
		);

		expect( screen.getByText( testName ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'subscriber-profile__email' ) ).toBeNull();
	} );
} );
