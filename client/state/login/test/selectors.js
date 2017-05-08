/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getTwoFactorAuthRequestError,
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getRequestError,
	getTwoFactorSupportedAuthTypes,
	isRequestingTwoFactorAuth,
	isRequesting,
	isTwoFactorEnabled,
	isTwoFactorAuthTypeSupported,
	getTwoFactorPushToken,
	getTwoFactorRememberMe,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushPollSuccess,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getTwoFactorUserId()', () => {
		it( 'should return null if there is no information yet', () => {
			const id = getTwoFactorUserId( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return the two factor auth ID if there is such', () => {
			const id = getTwoFactorUserId( {
				login: {
					twoFactorAuth: {
						user_id: 123456,
					}
				}
			} );

			expect( id ).to.equal( 123456 );
		} );
	} );

	describe( 'getTwoFactorAuthNonce()', () => {
		it( 'should return null if there is no information yet', () => {
			const id = getTwoFactorUserId( undefined );

			expect( id ).to.be.null;
		} );

		it( 'should return the two factor auth nonce if there is such', () => {
			const nonce = getTwoFactorAuthNonce( {
				login: {
					twoFactorAuth: {
						two_step_nonce: 'abcdef123456',
					}
				}
			} );

			expect( nonce ).to.equal( 'abcdef123456' );
		} );
	} );

	describe( 'isRequestingTwoFactorAuth', () => {
		it( 'should return false by default', () => {
			expect( isRequestingTwoFactorAuth( undefined ) ).to.be.false;
		} );

		it( 'should return true if the request is in progress', () => {
			expect( isRequestingTwoFactorAuth( {
				login: {
					isRequestingTwoFactorAuth: true
				}
			} ) ).to.be.true;
		} );

		it( 'should return false if the request is not in progress', () => {
			expect( isRequestingTwoFactorAuth( {
				login: {
					isRequestingTwoFactorAuth: false
				}
			} ) ).to.be.false;
		} );
	} );

	describe( 'getRequestError', () => {
		it( 'should return null by default', () => {
			expect( getRequestError( undefined ) ).to.be.null;
		} );

		it( 'should return null if there is no error', () => {
			expect( getRequestError( {
				login: {
					requestError: null
				}
			} ) ).to.be.null;
		} );

		it( 'should return an error object for the request if there is an error', () => {
			expect( getRequestError( {
				login: {
					requestError: { message: 'some error' }
				}
			} ) ).to.eql( { message: 'some error' } );
		} );
	} );

	describe( 'getTwoFactorAuthRequestError', () => {
		it( 'should return null by default', () => {
			expect( getTwoFactorAuthRequestError( undefined ) ).to.be.null;
		} );

		it( 'should return null if there is no error', () => {
			expect( getTwoFactorAuthRequestError( {
				login: {
					twoFactorAuthRequestError: null
				}
			} ) ).to.be.null;
		} );

		it( 'should return an error for the request if there is an error', () => {
			expect( getTwoFactorAuthRequestError( {
				login: {
					twoFactorAuthRequestError: 'some error'
				}
			} ) ).to.equal( 'some error' );
		} );
	} );

	describe( 'isRequesting()', () => {
		it( 'should return false if there is no information yet', () => {
			expect( isRequesting( undefined ) ).to.be.false;
		} );

		it( 'should return true/false depending on the state of the request', () => {
			expect( isRequesting( { login: { isRequesting: false } } ) ).to.be.false;
			expect( isRequesting( { login: { isRequesting: true } } ) ).to.be.true;
		} );
	} );

	describe( 'isTwoFactorEnabled()', () => {
		it( 'should return null if there is no two factor information yet', () => {
			const twoFactorEnabled = isTwoFactorEnabled( undefined );

			expect( twoFactorEnabled ).to.be.null;
		} );

		it( 'should return true if the request was successful and two-factor auth is enabled', () => {
			const twoFactorEnabled = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						user_id: 123456,
						two_step_nonce: 'abcdef123456',
						result: true,
					}
				}
			} );

			expect( twoFactorEnabled ).to.be.true;
		} );

		it( 'should return false if the request was successful and two-factor auth is not', () => {
			const twoFactorEnabled = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						user_id: '',
						two_step_nonce: '',
						result: true,
					}
				}
			} );

			expect( twoFactorEnabled ).to.be.false;
		} );

		it( 'should return false if the request was unsuccessful', () => {
			const twoFactorEnabled = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						user_id: '',
						two_step_nonce: '',
						result: false,
					}
				}
			} );

			expect( twoFactorEnabled ).to.be.false;
		} );
	} );

	describe( 'getTwoFactorSupportedAuthTypes', () => {
		it( 'should return null if there is no information yet', () => {
			expect( getTwoFactorSupportedAuthTypes( undefined ) ).to.be.null;
		} );

		it( 'should return the supported auth types if they exist in state', () => {
			const authTypes = getTwoFactorSupportedAuthTypes( {
				login: {
					twoFactorAuth: {
						two_step_supported_auth_types: [ 'authenticator', 'sms' ],
					}
				}
			} );

			expect( authTypes ).to.eql( [ 'authenticator', 'sms' ] );
		} );
	} );

	describe( 'isTwoFactorAuthTypeSupported', () => {
		const state = deepFreeze( {
			login: {
				twoFactorAuth: {
					two_step_supported_auth_types: [ 'authenticator', 'sms' ],
				}
			}
		} );

		it( 'should return null when the state is not there yet', () => {
			expect( isTwoFactorAuthTypeSupported( null, 'sms' ) ).to.be.null;
		} );

		it( 'should return false when the supported auth type does not exist in the state', () => {
			expect( isTwoFactorAuthTypeSupported( state, 'unknown' ) ).to.be.false;
		} );

		it( 'should return true when the supported auth type exists in the state', () => {
			expect( isTwoFactorAuthTypeSupported( state, 'sms' ) ).to.be.true;
		} );
	} );

	describe( 'getTwoFactorPushToken()', () => {
		it( 'should return null by default', () => {
			expect( getTwoFactorPushToken( undefined ) ).to.be.null;
		} );

		it( "should return push token when it's set", () => {
			const token = '12345';
			expect( getTwoFactorPushToken( {
				login: {
					twoFactorAuth: {
						push_web_token: token
					}
				}
			} ) ).to.eql( token );
		} );
	} );

	describe( 'getTwoFactorRememberMe()', () => {
		it( 'should return false by default', () => {
			expect( getTwoFactorRememberMe( undefined ) ).to.be.false;
		} );

		it( "should return remember me flag when it's set", () => {
			const rememberMe = true;
			expect( getTwoFactorRememberMe( {
				login: {
					twoFactorAuth: {
						remember_me: rememberMe
					}
				}
			} ) ).to.eql( rememberMe );
		} );
	} );

	describe( 'getTwoFactorPushPollInProgress()', () => {
		it( 'should return false by default', () => {
			expect( getTwoFactorPushPollInProgress( undefined ) ).to.be.false;
		} );

		it( 'should return polling progresss status', () => {
			const inProgress = true;
			expect( getTwoFactorPushPollInProgress( {
				login: {
					twoFactorAuthPushPoll: {
						inProgress
					}
				}
			} ) ).to.eql( inProgress );
		} );
	} );

	describe( 'getTwoFactorPushPollSuccess()', () => {
		it( 'should return false by default', () => {
			expect( getTwoFactorPushPollSuccess( undefined ) ).to.be.false;
		} );

		it( 'should return push polling success status', () => {
			const success = true;
			expect( getTwoFactorPushPollSuccess( {
				login: {
					twoFactorAuthPushPoll: {
						success
					}
				}
			} ) ).to.eql( success );
		} );
	} );
} );
