/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
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

const EMPTY_STATE = {
	login: {},
};

describe( 'selectors', () => {
	describe( 'getTwoFactorUserId()', () => {
		test( 'should return null if there is no information yet', () => {
			const id = getTwoFactorUserId( EMPTY_STATE );

			expect( id ).toBeNull();
		} );

		test( 'should return the two factor auth ID if there is such', () => {
			const id = getTwoFactorUserId( {
				login: {
					twoFactorAuth: {
						user_id: 123456,
					},
				},
			} );

			expect( id ).toStrictEqual( 123456 );
		} );
	} );

	describe( 'getTwoFactorAuthNonce()', () => {
		test( 'should return null if there is no information yet', () => {
			const id = getTwoFactorUserId( EMPTY_STATE );

			expect( id ).toBeNull();
		} );

		test( 'should return the two factor auth nonce for push if there is such', () => {
			const nonce = getTwoFactorAuthNonce(
				{
					login: {
						twoFactorAuth: {
							two_step_nonce_push: 'abcdef123456',
						},
					},
				},
				'push'
			);

			expect( nonce ).toStrictEqual( 'abcdef123456' );
		} );

		test( 'should return the two factor auth nonce for sms if there is such', () => {
			const nonce = getTwoFactorAuthNonce(
				{
					login: {
						twoFactorAuth: {
							two_step_nonce_sms: 'abcdef123456',
						},
					},
				},
				'sms'
			);

			expect( nonce ).toStrictEqual( 'abcdef123456' );
		} );
	} );

	describe( 'isRequestingTwoFactorAuth', () => {
		test( 'should return false by default', () => {
			expect( isRequestingTwoFactorAuth( EMPTY_STATE ) ).toBeFalsy();
		} );

		test( 'should return true if the request is in progress', () => {
			expect(
				isRequestingTwoFactorAuth( {
					login: {
						isRequestingTwoFactorAuth: true,
					},
				} )
			).toBeTruthy();
		} );

		test( 'should return false if the request is not in progress', () => {
			expect(
				isRequestingTwoFactorAuth( {
					login: {
						isRequestingTwoFactorAuth: false,
					},
				} )
			).toBeFalsy();
		} );
	} );

	describe( 'getRequestError', () => {
		test( 'should return null by default', () => {
			expect( getRequestError( EMPTY_STATE ) ).toBeNull();
		} );

		test( 'should return null if there is no error', () => {
			expect(
				getRequestError( {
					login: {
						requestError: null,
					},
				} )
			).toBeNull();
		} );

		test( 'should return an error object for the request if there is an error', () => {
			expect(
				getRequestError( {
					login: {
						requestError: { message: 'some error' },
					},
				} )
			).toEqual( { message: 'some error' } );
		} );
	} );

	describe( 'getTwoFactorAuthRequestError', () => {
		test( 'should return null by default', () => {
			expect( getTwoFactorAuthRequestError( EMPTY_STATE ) ).toBeNull();
		} );

		test( 'should return null if there is no error', () => {
			expect(
				getTwoFactorAuthRequestError( {
					login: {
						twoFactorAuthRequestError: null,
					},
				} )
			).toBeNull();
		} );

		test( 'should return an error for the request if there is an error', () => {
			expect(
				getTwoFactorAuthRequestError( {
					login: {
						twoFactorAuthRequestError: 'some error',
					},
				} )
			).toStrictEqual( 'some error' );
		} );
	} );

	describe( 'isRequesting()', () => {
		test( 'should return false if there is no information yet', () => {
			expect( isRequesting( EMPTY_STATE ) ).toBeFalsy();
		} );

		test( 'should return true/false depending on the state of the request', () => {
			expect( isRequesting( { login: { isRequesting: false } } ) ).toBeFalsy();
			expect( isRequesting( { login: { isRequesting: true } } ) ).toBeTruthy();
		} );
	} );

	describe( 'isFormDisabled()', () => {
		test( 'should return false if there is no information yet', () => {
			expect( isFormDisabled( EMPTY_STATE ) ).toBeFalsy();
		} );

		test( 'should return true/false depending on the state of the request', () => {
			expect( isFormDisabled( { login: { isFormDisabled: false } } ) ).toBeFalsy();
			expect( isFormDisabled( { login: { isFormDisabled: true } } ) ).toBeTruthy();
		} );
	} );

	describe( 'isTwoFactorEnabled()', () => {
		test( 'should return false if there is no two factor information yet', () => {
			const twoFactorEnabled = isTwoFactorEnabled( EMPTY_STATE );

			expect( twoFactorEnabled ).toBeFalsy();
		} );

		test( 'should return true if the request was successful and two-factor auth is enabled', () => {
			const twoFactorEnabled = isTwoFactorEnabled( {
				login: {
					twoFactorAuth: {
						user_id: 123456,
						two_step_nonce: 'abcdef123456',
					},
				},
			} );

			expect( twoFactorEnabled ).toBeTruthy();
		} );
	} );

	describe( 'getTwoFactorSupportedAuthTypes', () => {
		test( 'should return null if there is no information yet', () => {
			expect( getTwoFactorSupportedAuthTypes( EMPTY_STATE ) ).toBeNull();
		} );

		test( 'should return the supported auth types if they exist in state', () => {
			const authTypes = getTwoFactorSupportedAuthTypes( {
				login: {
					twoFactorAuth: {
						two_step_supported_auth_types: [ 'authenticator', 'sms' ],
					},
				},
			} );

			expect( authTypes ).toEqual( [ 'authenticator', 'sms' ] );
		} );
	} );

	describe( 'isTwoFactorAuthTypeSupported', () => {
		const state = deepFreeze( {
			login: {
				twoFactorAuth: {
					two_step_supported_auth_types: [ 'authenticator', 'sms' ],
				},
			},
		} );

		test( 'should return null when the state is not there yet', () => {
			expect( isTwoFactorAuthTypeSupported( EMPTY_STATE, 'sms' ) ).toBeNull();
		} );

		test( 'should return false when the supported auth type does not exist in the state', () => {
			expect( isTwoFactorAuthTypeSupported( state, 'unknown' ) ).toBeFalsy();
		} );

		test( 'should return true when the supported auth type exists in the state', () => {
			expect( isTwoFactorAuthTypeSupported( state, 'sms' ) ).toBeTruthy();
		} );
	} );

	describe( 'getTwoFactorPushToken()', () => {
		test( 'should return null by default', () => {
			expect( getTwoFactorPushToken( EMPTY_STATE ) ).toBeNull();
		} );

		test( "should return push token when it's set", () => {
			const token = '12345';
			expect(
				getTwoFactorPushToken( {
					login: {
						twoFactorAuth: {
							push_web_token: token,
						},
					},
				} )
			).toEqual( token );
		} );
	} );

	describe( 'getTwoFactorPushPollInProgress()', () => {
		test( 'should return false by default', () => {
			expect( getTwoFactorPushPollInProgress( EMPTY_STATE ) ).toBeFalsy();
		} );

		test( 'should return polling progresss status', () => {
			const inProgress = true;
			expect(
				getTwoFactorPushPollInProgress( {
					login: {
						twoFactorAuthPushPoll: {
							inProgress,
						},
					},
				} )
			).toEqual( inProgress );
		} );
	} );

	describe( 'getTwoFactorPushPollSuccess()', () => {
		test( 'should return false by default', () => {
			expect( getTwoFactorPushPollSuccess( EMPTY_STATE ) ).toBeFalsy();
		} );

		test( 'should return push polling success status', () => {
			const success = true;
			expect(
				getTwoFactorPushPollSuccess( {
					login: {
						twoFactorAuthPushPoll: {
							success,
						},
					},
				} )
			).toEqual( success );
		} );
	} );

	describe( 'getSocialAccountLinkAuthInfo()', () => {
		test( 'should return null if there is no information yet', () => {
			expect( getSocialAccountLinkAuthInfo( EMPTY_STATE ) ).toBeNull();
		} );

		test( 'should return the social account authentication information when available', () => {
			const socialAccountInfo = {
				service: 'google',
				access_token: 'a_token',
				id_token: 'another_token',
			};
			expect(
				getSocialAccountLinkAuthInfo( {
					login: {
						socialAccountLink: {
							authInfo: socialAccountInfo,
						},
					},
				} )
			).toEqual( socialAccountInfo );
		} );
	} );

	describe( 'getCreateSocialAccountError()', () => {
		test( 'return null if create error not set', () => {
			expect(
				getCreateSocialAccountError( {
					login: {
						socialAccount: {},
					},
				} )
			).toBeNull();
		} );

		test( 'return error object if create error is set', () => {
			const createError = { message: 'hello' };

			expect(
				getCreateSocialAccountError( {
					login: {
						socialAccount: {
							createError,
						},
					},
				} )
			).toEqual( createError );
		} );
	} );

	describe( 'getSocialAccountIsLinking()', () => {
		test( 'return social account linking status', () => {
			const socialAccountLink = { isLinking: true };

			expect(
				getSocialAccountIsLinking( {
					login: {
						socialAccountLink,
					},
				} )
			).toEqual( true );
		} );
	} );

	describe( 'getSocialAccountLinkEmail()', () => {
		test( 'return social account linking email', () => {
			const socialAccountLink = { email: 'test@hello.world' };

			expect(
				getSocialAccountLinkEmail( {
					login: {
						socialAccountLink,
					},
				} )
			).toEqual( 'test@hello.world' );
		} );
	} );

	describe( 'getSocialAccountLinkService()', () => {
		test( 'return social account linking service', () => {
			const socialAccountLink = { authInfo: { service: 'google' } };

			expect(
				getSocialAccountLinkService( {
					login: {
						socialAccountLink,
					},
				} )
			).toEqual( 'google' );
		} );
	} );
} );
