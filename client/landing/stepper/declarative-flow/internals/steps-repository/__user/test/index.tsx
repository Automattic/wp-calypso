/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

const renderUserStep = ( {
	flow = 'onboarding',
	url = '/onboarding/user',
	redirectTo,
}: { flow?: string; url?: string; redirectTo?: string } = {} ) => {
	return renderWithProvider(
		<MemoryRouter initialEntries={ [ url ] }>
			<UserStep
				flow={ flow }
				stepName="user"
				navigation={ { submit: jest.fn() } }
				{ ...( redirectTo !== undefined && { redirectTo } ) }
			/>
		</MemoryRouter>,
		{ reducers: { login: loginReducer, route: routeReducer } }
	);
};

describe( 'User email signup step', () => {
	it( 'passes userEmail from user_email query param to SignupFormSocialFirst', () => {
		renderUserStep( { url: '/onboarding/user?user_email=hello@wp.com' } );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( 'hello@wp.com' );
	} );

	it( 'defaults userEmail to empty string when user_email is missing', () => {
		renderUserStep();
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( '' );
	} );
} );

describe( 'Login redirect', () => {
	it( 'redirects to /sites when flow is onboarding', () => {
		renderUserStep( { redirectTo: '/setup/onboarding/domains' } );
		const loginLink = screen.getByRole( 'link', { name: 'Log in' } );
		expect( loginLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'redirect_to=%2Fsites' )
		);
	} );

	it( 'uses the provided redirectTo when flow is not onboarding', () => {
		renderUserStep( {
			flow: 'site-setup',
			url: '/site-setup/user',
			redirectTo: '/setup/site-setup/goals',
		} );
		const loginLink = screen.getByRole( 'link', { name: 'Log in' } );
		expect( loginLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'redirect_to=%2Fsetup%2Fsite-setup%2Fgoals' )
		);
	} );
} );
