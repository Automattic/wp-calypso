/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { createResolvers } from '../resolvers';

const { getCurrentUser } = createResolvers( { client_id: '', client_secret: '' } );

describe( 'getCurrentUser', () => {
	it( 'should return a receiveCurrentUser action object on success', async () => {
		const apiResponse = {
			ID: 1,
			username: 'testusername',
		};

		const generator = getCurrentUser();

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: {
				path: '/me',
				apiVersion: '1.1',
			},
		} );

		const finalResult = generator.next( apiResponse );
		expect( finalResult.value ).toEqual( {
			type: 'RECEIVE_CURRENT_USER',
			currentUser: apiResponse,
		} );

		expect( finalResult.done ).toBe( true );
	} );

	it( 'should return a receiveCurrentUserFailed action object on fail', async () => {
		const apiResponse = {
			error: 'authorization_required',
			status: 403,
			statusCode: 403,
			name: 'AuthorizationRequiredError',
			message: 'An active access token must be used to query information about the current user.',
		};

		const generator = getCurrentUser();

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: {
				path: '/me',
				apiVersion: '1.1',
			},
		} );

		const finalResult = generator.throw( apiResponse );
		expect( finalResult.value ).toEqual( {
			type: 'RECEIVE_CURRENT_USER_FAILED',
		} );

		expect( finalResult.done ).toBe( true );
	} );
} );
