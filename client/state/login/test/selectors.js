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
	getTwoFactorAuthId,
	getTwoFactorAuthNonce,
	isTwoFactorEnabled,
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

	describe( 'getTwoFactorAuthId()', () => {
		it( 'should return null if there is no information yet', () => {
			const id = getTwoFactorAuthId( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return the two factor auth ID if there is such', () => {
			const id = getTwoFactorAuthId( {
				login: {
					twoFactorAuth: {
						twostep_id: 123456,
					}
				}
			} );

			expect( id ).to.eql( 123456 );
		} );
	} );

	describe( 'getTwoFactorAuthNonce()', () => {
		it( 'should return null if there is no information yet', () => {
			const id = getTwoFactorAuthId( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return the two factor auth nonce if there is such', () => {
			const nonce = getTwoFactorAuthNonce( {
				login: {
					twoFactorAuth: {
						twostep_nonce: 'abcdef123456',
					}
				}
			} );

			expect( nonce ).to.eql( 'abcdef123456' );
		} );
	} );

	describe( 'isTwoFactorEnabled()', () => {
		it( 'should return null if there is no two factor information yet', () => {
			const id = isTwoFactorEnabled( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return true if the request was successful and two-factor auth is enabled', () => {
			const id = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						twostep_id: 123456,
						twostep_nonce: 'abcdef123456',
						result: true,
					}
				}
			} );

			expect( id ).to.be.true;
		} );

		it( 'should return false if the request was successful and two-factor auth is not', () => {
			const id = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						twostep_id: '',
						twostep_nonce: '',
						result: true,
					}
				}
			} );

			expect( id ).to.be.false;
		} );

		it( 'should return false if the request was unsuccessful', () => {
			const id = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						twostep_id: '',
						twostep_nonce: '',
						result: false,
					}
				}
			} );

			expect( id ).to.be.false;
		} );
	} );
} );
