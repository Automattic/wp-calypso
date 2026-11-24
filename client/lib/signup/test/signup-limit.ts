import { signupThrottleRetryAfter } from '../signup-limit';

describe( 'signupThrottleRetryAfter', () => {
	it( 'returns the wait a throttled signup names', () => {
		expect( signupThrottleRetryAfter( { error: 'throttled', data: { retry_after: 900 } } ) ).toBe(
			900
		);
	} );

	it.each( [
		[ 'no data', { error: 'throttled' } ],
		[ 'no wait', { error: 'throttled', data: {} } ],
		[ 'a wait of zero', { error: 'throttled', data: { retry_after: 0 } } ],
		[ 'a wait that is not a number', { error: 'throttled', data: { retry_after: '900' } } ],
	] )( 'returns null for a throttled signup with %s', ( _, error ) => {
		expect( signupThrottleRetryAfter( error ) ).toBeNull();
	} );

	it( 'returns null for other errors, even with a wait', () => {
		expect(
			signupThrottleRetryAfter( { error: 'invalid_email', data: { retry_after: 900 } } )
		).toBeNull();
		expect( signupThrottleRetryAfter( undefined ) ).toBeNull();
	} );
} );
