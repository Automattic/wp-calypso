/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '../stats';
import { createListRenderTracker } from '../track-list-render';

jest.mock( '../stats', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'createListRenderTracker', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.spyOn( performance, 'now' ).mockReturnValue( 1000 );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	const render = ( track, noteCount, filterName = 'all' ) =>
		track( { filterName, noteCount, startedAt: 988 } );

	it( 'reports a baseline on the first render', () => {
		render( createListRenderTracker( 'panel' ), 10 );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_notification_list_render', {
			surface: 'panel',
			filter: 'all',
			note_count: 10,
			render_time_in_ms: 12,
		} );
	} );

	it( 'ignores an empty list so the first real count still reports', () => {
		const track = createListRenderTracker( 'app' );

		render( track, 0 );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		render( track, 10 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_notification_list_render',
			expect.objectContaining( { note_count: 10 } )
		);
	} );

	it( 'reports once per milestone crossed, not once per render', () => {
		const track = createListRenderTracker( 'app' );

		[ 10, 20, 30, 40, 50, 60, 70, 100, 110 ].forEach( ( count ) => render( track, count ) );

		expect( recordTracksEvent.mock.calls.map( ( [ , props ] ) => props.note_count ) ).toEqual( [
			10, 50, 100,
		] );
	} );

	it( 'stays quiet while the count grows within a milestone', () => {
		const track = createListRenderTracker( 'app' );
		render( track, 50 );
		recordTracksEvent.mockClear();

		[ 60, 70, 80, 90, 99 ].forEach( ( count ) => render( track, count ) );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not report when the list shrinks back past a milestone', () => {
		const track = createListRenderTracker( 'app' );
		render( track, 100 );
		recordTracksEvent.mockClear();

		render( track, 60 );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'restarts its milestones when the filter changes', () => {
		const track = createListRenderTracker( 'app' );
		render( track, 100, 'all' );
		recordTracksEvent.mockClear();

		render( track, 10, 'unread' );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_notification_list_render',
			expect.objectContaining( { filter: 'unread', note_count: 10 } )
		);
	} );
} );
