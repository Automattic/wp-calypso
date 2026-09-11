/**
 * @jest-environment jsdom
 */
import SignupExistingAccountNotice from 'calypso/blocks/login/signup-existing-account-notice';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const renderAtPath = ( initialPath ) =>
	renderWithProvider( <SignupExistingAccountNotice />, { initialPath } );

describe( 'SignupExistingAccountNotice', () => {
	test( 'names the address signup redirected with', () => {
		const { container } = renderAtPath(
			'/log-in?is_signup_existing_account=true&email_address=user@example.com'
		);

		expect( container ).toHaveTextContent( 'account with the email user@example.com' );
	} );

	test( 'stays generic when the redirect carried no address', () => {
		const { container } = renderAtPath( '/log-in?is_signup_existing_account=true' );

		expect( container ).toHaveTextContent( 'account with that email address' );
	} );

	test( 'ignores an address left over in the initial query', () => {
		const { container } = renderWithProvider( <SignupExistingAccountNotice />, {
			reducers: { route: routeReducer },
			initialState: {
				route: {
					query: {
						initial: { email_address: 'stale@example.com' },
						current: { is_signup_existing_account: 'true', email_address: 'fresh@example.com' },
					},
				},
			},
		} );

		expect( container ).toHaveTextContent( 'fresh@example.com' );
		expect( container ).not.toHaveTextContent( 'stale@example.com' );
	} );

	test( 'shows nothing on an ordinary login', () => {
		const { container } = renderAtPath( '/log-in' );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
