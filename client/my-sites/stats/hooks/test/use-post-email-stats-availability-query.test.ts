import { hasEmailStats } from '../use-post-email-stats-availability-query';

describe( 'hasEmailStats', () => {
	it( 'returns false when there is no data', () => {
		expect( hasEmailStats( undefined ) ).toBe( false );
		expect( hasEmailStats( {} ) ).toBe( false );
	} );

	it( 'returns false when the counters are null or zero', () => {
		expect( hasEmailStats( { total_sends: null, total_opens: null } ) ).toBe( false );
		expect( hasEmailStats( { total_sends: 0, total_opens: 0 } ) ).toBe( false );
	} );

	it( 'returns true when the post has sends', () => {
		expect( hasEmailStats( { total_sends: 68036, total_opens: 0 } ) ).toBe( true );
	} );

	it( 'returns true when the post has opens even if sends are not reported', () => {
		expect( hasEmailStats( { total_sends: 0, total_opens: 9109 } ) ).toBe( true );
	} );
} );
