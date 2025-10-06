/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

jest.mock( 'calypso/blocks/signup-form/signup-form-social-first', () => {
	return {
		__esModule: true,
		default: ( props: any ) => (
			<div data-testid="signup-form" data-user-email={ props.userEmail } />
		),
	};
} );

describe( 'User email signup step', () => {
	const renderUserStep = ( url = '/onboarding/user?user_email=test@example.com' ) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ {} } />
			</MemoryRouter>,
			{ initialState: { currentUser: {} } }
		);
	};

	it( 'passes userEmail from user_email query param to SignupFormSocialFirst', () => {
		const { getByTestId } = renderUserStep( '/onboarding/user?user_email=hello@wp.com' );
		const node = getByTestId( 'signup-form' );
		expect( node.getAttribute( 'data-user-email' ) ).toBe( 'hello@wp.com' );
	} );

	it( 'defaults userEmail to empty string when user_email is missing', () => {
		const { getByTestId } = renderUserStep( '/onboarding/user' );
		const node = getByTestId( 'signup-form' );
		expect( node.getAttribute( 'data-user-email' ) ).toBe( '' );
	} );
} );
