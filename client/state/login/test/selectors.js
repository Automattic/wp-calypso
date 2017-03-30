/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingLogin,
	isLoginSuccessful,
	getError,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingLogin()', () => {
		it( 'should return false if there is no login information yet', () => {
			const id = isRequestingLogin( undefined );

			expect( id ).to.be.false;
		} );

		it( 'should return true if the login request is currently being processed', () => {
			const id = isRequestingLogin( {
				login: {
					isRequesting: true,
				}
			} );

			expect( id ).to.be.true;
		} );

		it( 'should return false if the login request is currently not being processed', () => {
			const id = isRequestingLogin( {
				login: {
					isRequesting: false,
				}
			} );

			expect( id ).to.be.false;
		} );
	} );

	describe( 'isLoginSuccessful()', () => {
		it( 'should return false if there is no login information yet', () => {
			const id = isLoginSuccessful( undefined );

			expect( id ).to.be.false;
		} );

		it( 'should return true if the login request was successful', () => {
			const id = isLoginSuccessful( {
				login: {
					requestSuccess: true,
				}
			} );

			expect( id ).to.be.true;
		} );

		it( 'should return false if the login request was not succesful', () => {
			const id = isLoginSuccessful( {
				login: {
					requestSuccess: false,
				}
			} );

			expect( id ).to.be.false;
		} );
	} );

	describe( 'getError()', () => {
		it( 'should return null if there is no error yet', () => {
			const id = getError( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return the error if there is such', () => {
			const id = getError( {
				login: {
					requestError: 'Incorrect password.'
				}
			} );

			expect( id ).to.eql( 'Incorrect password.' );
		} );
	} );
} );
