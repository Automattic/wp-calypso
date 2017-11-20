/** @format */
/**
 * Internal dependencies
 */
import jetpackAuthAttempts from '../jetpack-auth-attempts';
import { JETPACK_CONNECT_RETRY_AUTH } from 'state/action-types';

describe( '#jetpackAuthAttempts()', () => {
	test( 'should default to an empty object', () => {
		const state = jetpackAuthAttempts( undefined, {} );
		expect( state ).toEqual( {} );
	} );

	test( 'should update the timestamp when adding an existent slug with stale timestamp', () => {
		const state = jetpackAuthAttempts(
			{ 'example.com': { timestamp: 1, attempt: 1 } },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);
		expect( state[ 'example.com' ] ).toMatchObject( {
			timestamp: expect.any( Number ),
		} );
	} );

	test( 'should reset the attempt number to 0 when adding an existent slug with stale timestamp', () => {
		const state = jetpackAuthAttempts(
			{ 'example.com': { timestamp: 1, attempt: 1 } },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);

		expect( state[ 'example.com' ] ).toMatchObject( { attempt: 0 } );
	} );

	test( 'should store the attempt number when adding an existent slug with non-stale timestamp', () => {
		const state = jetpackAuthAttempts(
			{ 'example.com': { timestamp: Date.now(), attempt: 1 } },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);

		expect( state[ 'example.com' ] ).toMatchObject( { attempt: 2 } );
	} );
} );
