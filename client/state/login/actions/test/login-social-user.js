/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import {
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { remoteLoginUser } from 'calypso/state/login/actions/remote-login-user';
import { postLoginRequest } from 'calypso/state/login/utils';
import { loginSocialUser } from '../login-social-user';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getTracksAnonymousUserId: () => 'test-anonymous-id',
} ) );
jest.mock( 'calypso/lib/tos-acceptance-tracking', () => () => ( {} ) );
jest.mock( 'calypso/state/login/init', () => ( {} ) );
jest.mock( 'calypso/state/login/actions/remote-login-user', () => ( {
	remoteLoginUser: jest.fn(),
} ) );
jest.mock( 'calypso/state/login/utils', () => ( {
	...jest.requireActual( 'calypso/state/login/utils' ),
	postLoginRequest: jest.fn(),
} ) );

const socialInfo = {
	service: 'google',
	access_token: 'test-access-token',
	id_token: 'test-id-token',
};

describe( 'loginSocialUser', () => {
	let dispatch;

	beforeEach( () => {
		jest.clearAllMocks();
		dispatch = jest.fn();
		remoteLoginUser.mockResolvedValue();
	} );

	test( 'forwards Google tokens and waits for remote login before reporting success', async () => {
		const data = { token_links: [ 'https://example.test/remote-login' ] };
		postLoginRequest.mockResolvedValue( { body: { data } } );
		let completeRemoteLogin;
		remoteLoginUser.mockReturnValue(
			new Promise( ( resolve ) => {
				completeRemoteLogin = resolve;
			} )
		);

		const login = loginSocialUser( socialInfo, '/home' )( dispatch );
		await waitFor( () => expect( remoteLoginUser ).toHaveBeenCalledWith( data.token_links ) );

		expect( postLoginRequest ).toHaveBeenCalledWith(
			'social-login-endpoint',
			expect.objectContaining( { ...socialInfo, redirect_to: '/home' } )
		);
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( { type: SOCIAL_LOGIN_REQUEST } );

		completeRemoteLogin();
		await login;
		expect( dispatch ).toHaveBeenLastCalledWith( { type: SOCIAL_LOGIN_REQUEST_SUCCESS, data } );
	} );

	test( 'rejects a refused social login without attempting remote login', async () => {
		const data = {
			errors: [ { code: 'unknown_user', message: 'No connected account' } ],
			email: 'test@example.test',
		};
		postLoginRequest.mockRejectedValue( {
			status: 400,
			response: { body: { data } },
		} );

		await expect( loginSocialUser( socialInfo, '/home' )( dispatch ) ).rejects.toMatchObject( {
			code: 'unknown_user',
		} );
		expect( remoteLoginUser ).not.toHaveBeenCalled();
		expect( dispatch ).toHaveBeenLastCalledWith( {
			type: SOCIAL_LOGIN_REQUEST_FAILURE,
			error: {
				code: 'unknown_user',
				message: 'No connected account',
				field: 'global',
				email: data.email,
			},
			authInfo: socialInfo,
			data,
		} );
	} );
} );
