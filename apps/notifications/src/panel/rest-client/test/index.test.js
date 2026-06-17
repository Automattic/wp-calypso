/**
 * @jest-environment jsdom
 */
import { store } from '../../state';
import actions from '../../state/actions';
import getAllNotes from '../../state/selectors/get-all-notes';
import getUnreadNoteIds from '../../state/selectors/get-unread-note-ids';
import Client from '../index';
import { init } from '../wpcom';

// Distinct, monotonic timestamps so ordering is unambiguous: a higher id is a
// newer note, so the lowest id is always the oldest (last) in the sorted list.
const makeNote = ( id ) => ( {
	id,
	type: 'comment',
	timestamp: new Date( Date.UTC( 2026, 5, 1, 0, 0, id ) ).toISOString(),
	subject: [ { text: `note ${ id }` } ],
	note_hash: `hash-${ id }`,
} );

const fullPage = ( count, startId ) =>
	Array.from( { length: count }, ( _, i ) => makeNote( startId - i ) );

describe( 'RestClient', () => {
	let getCalls;
	let client;

	beforeEach( () => {
		jest.useFakeTimers();

		// The redux store is a shared singleton; clear it so each test starts empty.
		const ids = getAllNotes( store.getState() ).map( ( note ) => note.id );
		if ( ids.length ) {
			store.dispatch( actions.notes.removeNotes( ids ) );
		}

		getCalls = [];
		init( {
			req: {
				get: ( path, query, callback ) => getCalls.push( { path, query, callback } ),
				post: () => {},
			},
			pinghub: { connect: () => {} },
		} );
		client = new Client();
		// Pretend the panel is open without going through setVisibility(), which
		// would kick off an unrelated fetch.
		client.isVisible = true;
		getCalls.length = 0;
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
	} );

	// Seed the first window via the polling path and return its callback's notes.
	const seedFirstWindow = () => {
		client.getNotes();
		const firstWindow = fullPage( 10, 100 ); // ids 100..91, oldest is 91
		getCalls[ 0 ].callback( null, { notes: firstWindow, last_seen_time: 0 } );
		getCalls.length = 0;
	};

	describe( 'load-more pagination', () => {
		it( 'pages backwards with before=<oldest timestamp> and merges additively', () => {
			seedFirstWindow();
			const oldest = getAllNotes( store.getState() ).slice( -1 )[ 0 ];

			client.loadMore();

			expect( getCalls ).toHaveLength( 1 );
			// Fixed page size, anchored on the oldest loaded note's timestamp expressed
			// as the UNIX epoch seconds the endpoint's `before` cursor expects.
			expect( getCalls[ 0 ].query ).toMatchObject( {
				number: 10,
				before: Math.floor( Date.parse( oldest.timestamp ) / 1000 ),
			} );

			// A full older page merges in without dropping the first window.
			getCalls[ 0 ].callback( null, { notes: fullPage( 20, 90 ), last_seen_time: 0 } );
			const ids = getAllNotes( store.getState() ).map( ( note ) => note.id );
			expect( ids ).toContain( 100 ); // first window kept
			expect( ids ).toContain( 91 ); // first window kept
			expect( ids ).toContain( 71 ); // older page added
		} );

		it( 'does not send before on the initial window fetch', () => {
			client.getNotes();
			expect( getCalls[ 0 ].query ).not.toHaveProperty( 'before' );
		} );

		it( 'advances the cursor on each successive page', () => {
			seedFirstWindow();

			client.loadMore();
			const firstBefore = getCalls[ 0 ].query.before;
			getCalls[ 0 ].callback( null, { notes: fullPage( 20, 90 ), last_seen_time: 0 } );

			getCalls.length = 0;
			client.loadMore();

			expect( getCalls ).toHaveLength( 1 );
			const secondBefore = getCalls[ 0 ].query.before;
			// Cursor (epoch seconds) walked further back in time as older notes loaded.
			expect( secondBefore ).toBeLessThan( firstBefore );
		} );

		it( 'stops paging once the server returns a short page', () => {
			seedFirstWindow();

			client.loadMore();
			// Fewer than the requested page means the server has nothing older.
			getCalls[ 0 ].callback( null, { notes: fullPage( 5, 90 ), last_seen_time: 0 } );

			expect( client.hasMoreNotes() ).toBe( false );

			getCalls.length = 0;
			client.loadMore();
			// No further request: load-more settles instead of walking to the max.
			expect( getCalls ).toHaveLength( 0 );
		} );

		it( 'stops paging when a capped page echoes back only the anchor', () => {
			// 99 loaded leaves one slot under max_limit, so the next page is capped to
			// number=1. An inclusive `before` echoes that single anchor note back, so
			// the page is full-size (1 of 1) yet adds nothing new. Without the no-new-id
			// check this never latches and the catch-up loop refetches forever.
			store.dispatch( actions.notes.addNotes( fullPage( 99, 100 ) ) ); // ids 100..2

			client.loadMore();
			expect( getCalls ).toHaveLength( 1 );
			expect( getCalls[ 0 ].query.number ).toBe( 1 ); // capped to the remaining slot

			const oldest = getAllNotes( store.getState() ).slice( -1 )[ 0 ]; // id 2
			getCalls[ 0 ].callback( null, { notes: [ oldest ], last_seen_time: 0 } );

			expect( client.hasMoreNotes() ).toBe( false );

			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 0 );
		} );

		it( 'reports no more notes once the cap is reached', () => {
			// 100 notes (settings.max_limit) loaded means we never page past the cap.
			store.dispatch( actions.notes.addNotes( fullPage( 100, 100 ) ) );
			expect( client.hasMoreNotes() ).toBe( false );

			client.loadMore();
			expect( getCalls ).toHaveLength( 0 );
		} );
	} );

	describe( 'server-side (unread) filtering', () => {
		it( 'sends unread=1 to the server and adds the returned notes', () => {
			client.setFilter( { unread: 1 } );

			expect( getCalls ).toHaveLength( 1 );
			expect( getCalls[ 0 ].query ).toMatchObject( { unread: 1, number: 10 } );

			getCalls[ 0 ].callback( null, { notes: [ makeNote( 101 ) ], last_seen_time: 0 } );

			const ids = getAllNotes( store.getState() ).map( ( note ) => note.id );
			expect( ids ).toContain( 101 );
		} );

		it( 'stops paginating when the server returns a short page (empty Unread case)', () => {
			client.setFilter( { unread: 1 } );
			// A short page (fewer than `number`) means the server is exhausted.
			getCalls[ 0 ].callback( null, { notes: [], last_seen_time: 0 } );

			expect( client.filteredHasMore ).toBe( false );

			getCalls.length = 0;
			client.loadMore();
			// No further request once the server is exhausted.
			expect( getCalls ).toHaveLength( 0 );
		} );

		it( 'keeps paginating with a larger window while the server has more', () => {
			client.setFilter( { unread: 1 } );
			// A full page back implies more may exist.
			const firstPage = Array.from( { length: 10 }, ( _, i ) => makeNote( 200 + i ) );
			getCalls[ 0 ].callback( null, { notes: firstPage, last_seen_time: 0 } );

			expect( client.filteredHasMore ).toBe( true );

			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 1 );
			expect( getCalls[ 0 ].query ).toMatchObject( { unread: 1, number: 20 } );
		} );

		it( 'replaces the unread id list with the response, leaving the shared store intact', () => {
			// A note already cached (e.g. read on another device since it was loaded).
			store.dispatch( actions.notes.addNotes( [ makeNote( 500 ) ] ) );

			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: [ makeNote( 501 ) ], last_seen_time: 0 } );

			// The Unread view follows the server's id list, so 500 drops out of it…
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [ 501 ] );
			// …but the shared store is untouched, so the "All" view keeps both notes.
			const allIds = getAllNotes( store.getState() ).map( ( note ) => note.id );
			expect( allIds ).toEqual( expect.arrayContaining( [ 500, 501 ] ) );
		} );

		it( 'clears the unread id list when the filter changes', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: [ makeNote( 700 ) ], last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [ 700 ] );

			client.setFilter( null ); // switch back to "All"
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [] );
		} );

		// A filtered fetch must never remove notes from the shared store, so the
		// "All" view's count can't drop after a visit to the Unread tab.
		it( 'never removes notes from the shared store on a filtered fetch', () => {
			const all = Array.from( { length: 100 }, ( _, i ) => makeNote( 1000 + i ) );
			store.dispatch( actions.notes.addNotes( all ) );
			const before = getAllNotes( store.getState() ).length;

			client.setFilter( { unread: 1 } );
			// The unread response is a subset of what's already cached.
			getCalls[ 0 ].callback( null, {
				notes: [ makeNote( 1000 ), makeNote( 1001 ) ],
				last_seen_time: 0,
			} );

			expect( getAllNotes( store.getState() ).length ).toBe( before );
		} );

		it( 'accumulates unread notes across load-more pages and stops when exhausted', () => {
			// Each fetch re-requests a growing top-N window, so every response is a
			// superset; the id list is replaced and therefore grows.
			const page = ( count ) => Array.from( { length: count }, ( _, i ) => makeNote( 300 + i ) );

			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: page( 10 ), last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 10 );
			expect( client.filteredHasMore ).toBe( true );

			// Page 2: load-more requests number=20 and the list grows to 20.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls[ 0 ].query ).toMatchObject( { unread: 1, number: 20 } );
			getCalls[ 0 ].callback( null, { notes: page( 20 ), last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 20 );
			expect( client.filteredHasMore ).toBe( true );

			// Page 3: requests number=30 but the server returns fewer (25) — exhausted.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls[ 0 ].query ).toMatchObject( { unread: 1, number: 30 } );
			getCalls[ 0 ].callback( null, { notes: page( 25 ), last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 25 );
			expect( client.filteredHasMore ).toBe( false );

			// No more pages: load-more is a no-op.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 0 );
		} );

		// A new note arriving via the polling/push path (getNotes) while a filter is
		// active should refresh the filtered id list so the view picks it up live.
		it( 'refreshes the unread list when new notes arrive via the polling path', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: [ makeNote( 900 ) ], last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [ 900 ] );

			// The polling/push path fetches the unfiltered list (no `unread` param).
			getCalls.length = 0;
			client.getNotes();
			const pollCall = getCalls.find( ( call ) => call.query.unread === undefined );
			expect( pollCall ).toBeTruthy();

			// Its response includes a newly-arrived note and triggers a fresh filtered
			// fetch, which updates the unread list to include it.
			pollCall.callback( null, { notes: [ makeNote( 900 ), makeNote( 901 ) ], last_seen_time: 0 } );
			const refreshCall = getCalls.find( ( call ) => call.query.unread );
			expect( refreshCall ).toBeTruthy();
			refreshCall.callback( null, {
				notes: [ makeNote( 900 ), makeNote( 901 ) ],
				last_seen_time: 0,
			} );

			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [ 900, 901 ] );
		} );

		// Polling's getNotesList() prunes against the unfiltered window. While a
		// filter is active it must not drop a note that fell out of that window —
		// the Unread view still resolves it through the shared store.
		it( 'does not prune the shared store via getNotesList while a filter is active', () => {
			// Seed the polling window: 100 and 99 are in this.noteList and the store.
			client.getNotes();
			getCalls[ 0 ].callback( null, {
				notes: [ makeNote( 100 ), makeNote( 99 ) ],
				last_seen_time: 0,
			} );
			getCalls.length = 0;

			// A filter is active (e.g. the Unread tab).
			client.filter = { unread: 1 };

			// Polling sees 99 has dropped out of the unfiltered top window.
			client.getNotesList();
			getCalls[ 0 ].callback( null, { notes: [ makeNote( 100 ) ], last_seen_time: 0 } );

			// 99 stays in the store so the Unread view can still resolve it.
			expect( getAllNotes( store.getState() ).map( ( note ) => note.id ) ).toContain( 99 );
		} );
	} );
} );
