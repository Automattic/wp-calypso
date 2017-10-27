/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import jetpackAuthAttempts from '../jetpack-auth-attempts';
import { JETPACK_CONNECT_RETRY_AUTH } from 'state/action-types';

describe( '#jetpackAuthAttempts()', () => {
	test( 'should default to an empty object', () => {
		const state = jetpackAuthAttempts( undefined, {} );
		expect( state ).to.eql( {} );
	} );

	test( 'should update the timestamp when adding an existent slug with stale timestamp', () => {
		const nowTime = Date.now();
		const state = jetpackAuthAttempts(
			{ 'example.com': { timestamp: 1, attempt: 1 } },
			{
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 2,
			}
		);
		expect( state[ 'example.com' ] )
			.to.have.property( 'timestamp' )
			.to.be.at.least( nowTime );
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

		expect( state[ 'example.com' ] )
			.to.have.property( 'attempt' )
			.to.equals( 0 );
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

		expect( state[ 'example.com' ] )
			.to.have.property( 'attempt' )
			.to.equals( 2 );
	} );
} );
