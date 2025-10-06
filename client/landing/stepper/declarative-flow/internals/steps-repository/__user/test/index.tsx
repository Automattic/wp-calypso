/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

describe( 'User email signup step', () => {
	const renderUserStep = ( url = '/onboarding/user?user_email=test@example.com' ) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ { submit: jest.fn() } } />
			</MemoryRouter>,
			{ reducers: { login: loginReducer, route: routeReducer } }
		);
	};

	it( 'passes userEmail from user_email query param to SignupFormSocialFirst', () => {
		renderUserStep( '/onboarding/user?user_email=hello@wp.com' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( 'hello@wp.com' );
	} );

	it( 'defaults userEmail to empty string when user_email is missing', () => {
		renderUserStep( '/onboarding/user' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( '' );
	} );
} );
