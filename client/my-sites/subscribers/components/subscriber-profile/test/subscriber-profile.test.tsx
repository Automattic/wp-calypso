/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import SubscriberProfile from '../subscriber-profile';

const testName = 'Test Name';
const testEmail = 'test@test.com';
const testAvatar = 'testAvatar.jpg';
const testAvatarAlt = 'Profile pic';

describe( 'SubscriberProfile', () => {
	it( 'renders the name and email', () => {
		render(
			<SubscriberProfile avatar={ testAvatar } displayName={ testName } email={ testEmail } />
		);

		expect( screen.getByText( testName ) ).toBeInTheDocument();
		expect( screen.getByText( testEmail ) ).toBeInTheDocument();
		expect( screen.getByAltText( testAvatarAlt ) ).toBeInTheDocument();
	} );

	it( 'does not render the email if it is the same as the display name', () => {
		render(
			<SubscriberProfile avatar={ testAvatar } displayName={ testEmail } email={ testEmail } />
		);

		expect( screen.queryByText( testEmail ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'subscriber-profile__email' ) ).toBeNull();
	} );

	it( 'does not render the email if it is not provided', () => {
		render( <SubscriberProfile avatar={ testAvatar } displayName={ testName } email="" /> );

		expect( screen.getByText( testName ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'subscriber-profile__email' ) ).toBeNull();
	} );
} );
