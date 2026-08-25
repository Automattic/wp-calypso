/**
 * @jest-environment jsdom
 */

import { logBuildWowFeedDelta } from '../log-feed-delta';

describe( 'logBuildWowFeedDelta', () => {
	let group: jest.SpyInstance;
	let table: jest.SpyInstance;
	let log: jest.SpyInstance;
	let groupEnd: jest.SpyInstance;

	beforeEach( () => {
		group = jest.spyOn( console, 'groupCollapsed' ).mockImplementation( () => {} );
		table = jest.spyOn( console, 'table' ).mockImplementation( () => {} );
		log = jest.spyOn( console, 'log' ).mockImplementation( () => {} );
		groupEnd = jest.spyOn( console, 'groupEnd' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'heads the group with the run, cursor and event count, and tables a summary per event', () => {
		logBuildWowFeedDelta( {
			run_id: '3f2a91c4-aaaa-bbbb-cccc-ddddeeeeffff',
			latest_seq: 4,
			events: [
				{ seq: 3, type: 'identity', data: { title: 'Cafe Lumière' } },
				{
					seq: 4,
					type: 'section',
					key: 'page-home--hero',
					data: { heading: 'Small-batch & slow', section: 'hero' },
				},
			],
		} );

		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'run 3f2a91c4' );
		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'seq 4' );
		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( '2 events' );
		expect( table ).toHaveBeenCalledWith( [
			{ seq: 3, type: 'identity', key: '', summary: 'Cafe Lumière' },
			{ seq: 4, type: 'section', key: 'page-home--hero', summary: 'Small-batch & slow' },
		] );
		expect( groupEnd ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports asset sizes rather than dumping the blob into the group header', () => {
		logBuildWowFeedDelta( {
			run_id: 'run-a',
			latest_seq: 9,
			events: [
				{ seq: 9, type: 'design_asset', key: 'design_home', data: { ref: 'design_home' } },
			],
			assets: { design_home: 'x'.repeat( 2048 ) },
		} );

		expect( log ).toHaveBeenCalledWith( 'design_home — 2.0 KB' );
	} );

	it( 'says a superseded run is replaying instead of reporting a bogus count', () => {
		logBuildWowFeedDelta( { run_id: 'run-b', latest_seq: 0, events: [], reset: true } );

		expect( group.mock.calls[ 0 ][ 0 ] ).toContain( 'superseded' );
		expect( table ).not.toHaveBeenCalled();
	} );

	it( 'survives odd-shaped payloads, since every field is model-derived', () => {
		expect( () =>
			logBuildWowFeedDelta( {
				events: [
					{ seq: 1, type: 'identity' },
					{ seq: 2, type: 'page_plan', data: { pages: 'not an array' } },
					{ seq: 3, type: 'palette', data: { colors: null } },
					{ seq: 4, type: 'a_type_the_client_has_never_heard_of', data: { anything: true } },
				],
				assets: { design_css: undefined as unknown as string },
			} )
		).not.toThrow();

		expect( table ).toHaveBeenCalledWith( [
			{ seq: 1, type: 'identity', key: '', summary: '' },
			{ seq: 2, type: 'page_plan', key: '', summary: '' },
			{ seq: 3, type: 'palette', key: '', summary: '0 colors' },
			{ seq: 4, type: 'a_type_the_client_has_never_heard_of', key: '', summary: '' },
		] );
		expect( log ).toHaveBeenCalledWith( 'design_css — 0.0 KB' );
	} );
} );
