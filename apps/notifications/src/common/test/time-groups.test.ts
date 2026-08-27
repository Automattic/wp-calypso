import { getTimeGroupIndex } from '../time-groups';

describe( 'getTimeGroupIndex', () => {
	const now = new Date( '2026-08-27T00:00:00' ).getTime();
	const daysAgo = ( days: number ) => new Date( now - days * 24 * 60 * 60 * 1000 ).toISOString();

	it( 'buckets timestamps into the five groups', () => {
		expect( getTimeGroupIndex( new Date( now + 3600_000 ).toISOString(), now ) ).toBe( 0 );
		expect( getTimeGroupIndex( daysAgo( 0.5 ), now ) ).toBe( 1 );
		expect( getTimeGroupIndex( daysAgo( 3 ), now ) ).toBe( 2 );
		expect( getTimeGroupIndex( daysAgo( 10 ), now ) ).toBe( 3 );
		expect( getTimeGroupIndex( daysAgo( 60 ), now ) ).toBe( 4 );
	} );

	it( 'assigns an exact bucket boundary to the older group', () => {
		expect( getTimeGroupIndex( daysAgo( 1 ), now ) ).toBe( 2 );
	} );
} );
