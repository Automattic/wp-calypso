/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { Login } from '../index.jsx';
import useFakeDom from 'test/helpers/use-fake-dom';

const defaultProps = {
	magicLoginEnabled: true,
	magicLoginView: '',
	translate: ( str ) => {
		return str;
	}
};

describe( 'Login', () => {
	useFakeDom();

	describe( 'footerLinks', () => {
		it( 'should not have a return button before the state is loaded', () => {
			const login = new Login( defaultProps );
			const links = login.footerLinks();

			expect( links ).to.have.length( 2 );
		} );

		it( 'should not have a return button after the state is loaded, but there is no history', () => {
			const login = new Login( defaultProps );
			login.state.loaded = true;

			const links = login.footerLinks();

			expect( links ).to.have.length( 2 );
		} );

		it( 'should NOT ave a return button after the state is loaded, with history', () => {
			window.history.pushState( {}, '' );

			const login = new Login( defaultProps );
			login.state.loaded = true;

			const links = login.footerLinks();

			expect( links ).to.have.length( 3 );

			window.history.back();
		} );
	} );
} );
