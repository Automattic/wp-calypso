/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getRememberMe,
	getRequestError,
	getTwoFactorAuthNonce,
	getTwoFactorAuthRequestError,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushPollSuccess,
	getTwoFactorPushToken,
	getTwoFactorSupportedAuthTypes,
	getTwoFactorUserId,
	isRequesting,
	isRequestingTwoFactorAuth,
	isTwoFactorAuthTypeSupported,
	isTwoFactorEnabled,
	isFormDisabled,
	getSocialAccountLinkAuthInfo,
	getCreateSocialAccountError,
	getSocialAccountIsLinking,
	getSocialAccountLinkEmail,
	getSocialAccountLinkService,
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

		it( 'should return the two factor auth nonce for push if there is such', () => {
			const nonce = getTwoFactorAuthNonce( {
				login: {
					twoFactorAuth: {
						two_step_nonce_push: 'abcdef123456',
					}
				}
			}, 'push' );

			expect( nonce ).to.equal( 'abcdef123456' );
		} );

		it( 'should return the two factor auth nonce for sms if there is such', () => {
			const nonce = getTwoFactorAuthNonce( {
				login: {
					twoFactorAuth: {
						two_step_nonce_sms: 'abcdef123456',
					}
				}
			}, 'sms' );

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

	describe( 'isFormDisabled()', () => {
		it( 'should return false if there is no information yet', () => {
			expect( isFormDisabled( undefined ) ).to.be.false;
		} );

		it( 'should return true/false depending on the state of the request', () => {
			expect( isFormDisabled( { login: { isFormDisabled: false } } ) ).to.be.false;
			expect( isFormDisabled( { login: { isFormDisabled: true } } ) ).to.be.true;
		} );
	} );

	describe( 'isTwoFactorEnabled()', () => {
		it( 'should return false if there is no two factor information yet', () => {
			const twoFactorEnabled = isTwoFactorEnabled( undefined );

			expect( twoFactorEnabled ).to.be.false;
		} );

		it( 'should return true if the request was successful and two-factor auth is enabled', () => {
			const twoFactorEnabled = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						user_id: 123456,
						two_step_nonce: 'abcdef123456',
					}
				}
			} );

			expect( twoFactorEnabled ).to.be.true;
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

	describe( 'getRememberMe()', () => {
		it( 'should return false by default', () => {
			expect( getRememberMe( undefined ) ).to.be.false;
		} );

		it( "should return remember me flag when it's set", () => {
			const rememberMe = true;
			expect( getRememberMe( {
				login: {
					rememberMe
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

	describe( 'getSocialAccountLinkAuthInfo()', () => {
		it( 'should return null if there is no information yet', () => {
			expect( getSocialAccountLinkAuthInfo( undefined ) ).to.be.null;
		} );

		it( 'should return the social account authentication information when available', () => {
			const socialAccountInfo = {
				service: 'google',
				access_token: 'a_token',
				id_token: 'another_token',
			};
			expect( getSocialAccountLinkAuthInfo( {
				login: {
					socialAccountLink: {
						authInfo: socialAccountInfo,
					}
				}
			} ) ).to.deep.eql( socialAccountInfo );
		} );
	} );

	describe( 'getCreateSocialAccountError()', () => {
		it( 'return null if create error not set', () => {
			expect(
				getCreateSocialAccountError( {
					login: {
						socialAccount: {
						}
					}
				} )
			).to.be.null;
		} );

		it( 'return error object if create error is set', () => {
			const createError = { message: 'hello' };

			expect(
				getCreateSocialAccountError( {
					login: {
						socialAccount: {
							createError
						}
					}
				} )
			).to.eql( createError );
		} );
	} );

	describe( 'getSocialAccountIsLinking()', () => {
		it( 'return social account linking status', () => {
			const socialAccountLink = { isLinking: true };

			expect( getSocialAccountIsLinking( {
				login: {
					socialAccountLink
				}
			} ) ).to.eql( true );
		} );
	} );

	describe( 'getSocialAccountLinkEmail()', () => {
		it( 'return social account linking email', () => {
			const socialAccountLink = { email: 'test@hello.world' };

			expect( getSocialAccountLinkEmail( {
				login: {
					socialAccountLink
				}
			} ) ).to.eql( 'test@hello.world' );
		} );
	} );

	describe( 'getSocialAccountLinkService()', () => {
		it( 'return social account linking service', () => {
			const socialAccountLink = { authInfo: { service: 'google' } };

			expect( getSocialAccountLinkService( {
				login: {
					socialAccountLink
				}
			} ) ).to.eql( 'google' );
		} );
	} );
} );
