/**
 * Internal dependencies
 */
import { authAttempts, reducer } from '../jetpack-auth-attempts';
import {
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_RETRY_AUTH,
} from 'calypso/state/jetpack-connect/action-types';

describe( '#authAttempts()', () => {
	test( 'should update the timestamp when adding an existent slug with stale timestamp', () => {
		const state = authAttempts(
			{ timestamp: 1, attempt: 1 },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);
		expect( state ).toMatchObject( {
			timestamp: expect.any( Number ),
		} );
	} );

	test( 'should reset the attempt number to 0 when adding an existent slug with stale timestamp', () => {
		const state = authAttempts(
			{ timestamp: 1, attempt: 1 },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);

		expect( state ).toMatchObject( { attempt: 0 } );
	} );

	test( 'should store the attempt number when adding an existent slug with non-stale timestamp', () => {
		const state = authAttempts(
			{ timestamp: Date.now(), attempt: 1 },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);

		expect( state ).toMatchObject( { attempt: 2 } );
	} );

	test( 'should clear state on completion', () => {
		const state = authAttempts(
			{ timestamp: Date.now(), attempt: 1 },
			{
				type: JETPACK_CONNECT_COMPLETE_FLOW,
				slug: 'example.com',
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
				timestamp: 12345,
			},
			'example.com': {
				attempt: 1,
				timestamp: Infinity,
			},
		};
		const nextState = reducer( previousState, {
			type: JETPACK_CONNECT_RETRY_AUTH,
			attemptNumber: 2,
			slug: 'example.com',
		} );
		expect( nextState ).toMatchObject( {
			nonMatchingSlug: previousState.nonMatchingSlug,
			'example.com': {
				attempt: 2,
				timestamp: expect.any( Number ),
			},
		} );
	} );
} );
