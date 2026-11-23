/**
 * @jest-environment jsdom
 */
import { Login } from 'calypso/login/wp-login';

const isStackedLogin = ( props ) =>
	Login.prototype.isStackedLogin.call( {
		props: { isLoginView: true, isUserLoggedIn: false, ...props },
	} );

describe( 'Login#isStackedLogin', () => {
	it( 'stacks the main WordPress.com login', () => {
		expect( isStackedLogin( {} ) ).toBe( true );
	} );

	// A logo above the title switches the layout to the wider centered column, which the
	// stacked form doesn't fill.
	it.each( [ 'isFromAkismet', 'isFromStudioCheckout' ] )(
		'keeps the side-by-side layout for logins with a logo (%s)',
		( flag ) => {
			expect( isStackedLogin( { [ flag ]: true } ) ).toBe( false );
		}
	);
} );
