/**
 * @jest-environment jsdom
 */

import { logBuildWowFeedDelta } from '../log-feed-delta';

describe( 'logBuildWowFeedDelta', () => {
	let group: jest.SpyInstance;
	let log: jest.SpyInstance;
	let groupEnd: jest.SpyInstance;

	beforeEach( () => {
		group = jest.spyOn( console, 'group' ).mockImplementation( () => {} );
		log = jest.spyOn( console, 'log' ).mockImplementation( () => {} );
		groupEnd = jest.spyOn( console, 'groupEnd' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'heads the group with the run, cursor and event count', () => {
		logBuildWowFeedDelta( {
			run_id: '3f2a91c4-aaaa-bbbb-cccc-ddddeeeeffff',
			latest_seq: 4,
			events: [ { seq: 4, type: 'identity', data: { title: 'Cafe Lumière' } } ],
		} );

		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'run 3f2a91c4' );
		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'seq 4' );
		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( '1 event' );
		expect( groupEnd ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'logs the whole event object, not a reading of it', () => {
		const section = {
			seq: 11,
			t: 1755691200,
			type: 'section',
			key: 'page-home--hero',
			data: {
				part: 'section',
				page: 'home',
				section: 'hero',
				heading: 'Small-batch & slow',
				text: 'Roasted in the back, poured out front.',
				buttons: [ 'See the menu' ],
				images: [ { subject: 'espresso pour', style: 'documentary', aspect: '3:2' } ],
			},
		};

		logBuildWowFeedDelta( { run_id: 'run-a', latest_seq: 11, events: [ section ] } );

		expect( log ).toHaveBeenCalledWith( '#11 section · page-home--hero', section );
	} );

	it( 'logs asset contents in full rather than describing them', () => {
		const home = '<!DOCTYPE html><html><body><h1>Cafe Lumière</h1></body></html>';

		logBuildWowFeedDelta( {
			run_id: 'run-a',
			latest_seq: 9,
			events: [
				{ seq: 9, type: 'design_asset', key: 'design_home', data: { ref: 'design_home' } },
			],
			assets: { design_home: home },
		} );

		expect( log ).toHaveBeenCalledWith( 'asset design_home', home );
	} );

	it( 'logs the raw delta too, so a field this file does not know about still shows up', () => {
		const delta = {
			run_id: 'run-a',
			latest_seq: 2,
			events: [ { seq: 2, type: 'identity' } ],
			a_field_added_later: 'still visible',
		} as BuildWowFeedDeltaWithExtras;

		logBuildWowFeedDelta( delta );

		expect( log ).toHaveBeenCalledWith( 'delta', delta );
	} );

	it( 'says a superseded run is replaying instead of reporting a bogus count', () => {
		logBuildWowFeedDelta( { run_id: 'run-b', latest_seq: 0, events: [], reset: true } );

		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'superseded' );
	} );

	it( 'survives a delta with nothing in it', () => {
		expect( () => logBuildWowFeedDelta( {} ) ).not.toThrow();

		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'run unknown' );
		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( '0 events' );
	} );
} );

type BuildWowFeedDeltaWithExtras = Parameters< typeof logBuildWowFeedDelta >[ 0 ] &
	Record< string, unknown >;
