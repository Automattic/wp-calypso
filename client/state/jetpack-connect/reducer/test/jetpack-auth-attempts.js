/** @format */
/**
 * Internal dependencies
 */
import { authAttempts, reducer } from '../jetpack-auth-attempts';
import { JETPACK_CONNECT_COMPLETE_FLOW, JETPACK_CONNECT_RETRY_AUTH } from 'state/action-types';
import { isStale } from 'state/jetpack-connect/utils';

// The reducer relies on isStale, which compares a timestamp against Date.now().
// Nothing is stale in the default mock. Force stale as follows:
//
// isStale.mockImplementationOnce( () => true );
//
jest.mock( 'state/jetpack-connect/utils', () => ( {
	isStale: jest.fn( () => false ),
} ) );

describe( '#authAttempts()', () => {
	test( 'should update the timestamp and reset the count when retrying with a stale timestamp', () => {
		isStale.mockImplementationOnce( () => true );
		const state = authAttempts(
			{ timestamp: 1234, attempt: 1 },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				attemptNumber: 2,
				slug: 'example.com',
				timestamp: 5678,
			}
		);
		expect( state ).toEqual( {
			attempt: 0,
			timestamp: 5678,
		} );
	} );

	test( 'should store the attempt number and ignore the timestamp when retrying with a fresh timestamp', () => {
		const state = authAttempts(
			{ timestamp: 1234, attempt: 1 },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				attemptNumber: 2,
				slug: 'example.com',
				timestamp: 5678,
			}
		);

		expect( state ).toEqual( {
			attempt: 2,
			timestamp: 1234,
		} );
	} );

	test( 'should clear state on completion', () => {
		const state = authAttempts(
			{ timestamp: 1234, attempt: 1 },
			{
				type: JETPACK_CONNECT_COMPLETE_FLOW,
				attemptNumber: 2,
				slug: 'example.com',
				timestamp: 5678,
			}
		);

		expect( state ).not.toBeDefined();
	} );
} );

describe( '#reducer()', () => {
	test( 'should be keyed by slug', () => {
		const previousState = {
			nonMatchingSlug: {
				attempt: 1,
				timestamp: 1234,
			},
			'example.com': {
				attempt: 1,
				timestamp: 1234,
			},
		};
		const nextState = reducer( previousState, {
			type: JETPACK_CONNECT_RETRY_AUTH,
			attemptNumber: 2,
			slug: 'example.com',
			timestamp: 5678,
		} );
		expect( nextState ).toMatchObject( {
			nonMatchingSlug: previousState.nonMatchingSlug,
			'example.com': {
				attempt: 2,
				timestamp: 1234,
			},
		} );
	} );
} );
