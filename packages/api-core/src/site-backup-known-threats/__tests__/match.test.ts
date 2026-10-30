import { getKnownThreatsForRewindId } from '../fetchers';
import type { BackupsKnownThreatsPage } from '../types';

const counts = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

const page = (
	periods: number[],
	byPeriod: BackupsKnownThreatsPage[ 'byPeriod' ]
): BackupsKnownThreatsPage => ( {
	byPeriod,
	periods,
	latestWithoutKnownThreats: null,
	oldestPeriod: periods.length ? Math.min( ...periods ) : null,
	totalPages: 1,
} );

describe( 'getKnownThreatsForRewindId', () => {
	const first = page( [ 300, 200 ], { 300: counts( 1 ), 200: counts( 2 ) } );
	const second = page( [ 100 ], { 100: counts( 4 ) } );

	it( 'matches an exact backup period', () => {
		expect( getKnownThreatsForRewindId( first, '200' ) ).toEqual( counts( 2 ) );
		expect( getKnownThreatsForRewindId( first, '200.5' ) ).toEqual( counts( 2 ) );
	} );

	it( 'uses the containing backup for a realtime rewind id between backups', () => {
		expect( getKnownThreatsForRewindId( first, '250.123' ) ).toEqual( counts( 2 ) );
		expect( getKnownThreatsForRewindId( [ first, second ], '150' ) ).toEqual( counts( 4 ) );
	} );

	it( 'uses the newest backup for a rewind id after every backup', () => {
		expect( getKnownThreatsForRewindId( first, '999' ) ).toEqual( counts( 1 ) );
	} );

	it( 'returns null for a rewind id older than every backup', () => {
		expect( getKnownThreatsForRewindId( [ first, second ], '50' ) ).toBeNull();
	} );

	it( 'returns null when the containing backup has no known threats', () => {
		const pageWithout = page( [ 300, 200 ], { 200: counts( 2 ) } );
		expect( getKnownThreatsForRewindId( pageWithout, '350' ) ).toBeNull();
	} );

	it( 'returns null for invalid rewind ids', () => {
		expect( getKnownThreatsForRewindId( first, '' ) ).toBeNull();
		expect( getKnownThreatsForRewindId( first, 'abc' ) ).toBeNull();
	} );
} );
