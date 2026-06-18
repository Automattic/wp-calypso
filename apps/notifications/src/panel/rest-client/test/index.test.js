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

		// A filtered (Unread) fetch drops older notes into the shared store. The All
		// view's load-more must pace off its own window (`noteList`), or the `before`
		// cursor jumps past unloaded notes and paging latches half-loaded.
		it( 'keeps paging the All view from its own window after an Unread visit', () => {
			// All view's first window: ids 100..91 (oldest loaded = 91).
			seedFirstWindow();

			// Visit Unread; the response includes a note far older than the window.
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, {
				notes: [ makeNote( 91 ), makeNote( 5 ) ],
				last_seen_time: 0,
			} );
			getCalls.length = 0;

			// Back to the All view.
			client.setFilter( null );
			getCalls.length = 0;

			// Load-more must anchor on the All window's oldest (91), not the stray
			// unread note (5), and still consider there to be more to load.
			expect( client.hasMoreNotes() ).toBe( true );
			client.loadMore();

			expect( getCalls ).toHaveLength( 1 );
			expect( getCalls[ 0 ].query.before ).toBe(
				Math.floor( Date.parse( makeNote( 91 ).timestamp ) / 1000 )
			);

			// A full older page keeps the catch-up going instead of latching.
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 90 ), last_seen_time: 0 } );
			expect( client.hasMoreNotes() ).toBe( true );
		} );

		// Both hasMoreNotes and the request size must measure this view's own
		// window, not the shared store a filtered fetch can inflate to the cap —
		// otherwise the next page is requested as number=0 and the view stalls.
		it( 'keeps paging when a filtered fetch fills the shared store to the cap', () => {
			seedFirstWindow(); // All window: noteList = ids 100..91 (10 notes)
			// A filtered (Unread) visit dumps older notes into the store, filling it
			// to max_limit, while the All view's own window stays at 10.
			store.dispatch( actions.notes.addNotes( fullPage( 90, 90 ) ) ); // store now 100
			expect( client.hasMoreNotes() ).toBe( true );

			client.loadMore();
			expect( getCalls ).toHaveLength( 1 );
			// Anchored on the view's oldest (91) and sized off its own count (10 left
			// under the cap), not 0 from the full store.
			expect( getCalls[ 0 ].query ).toMatchObject( {
				number: 10,
				before: Math.floor( Date.parse( makeNote( 91 ).timestamp ) / 1000 ),
			} );
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

		it( 'pages older unread notes in with a before cursor while the server has more', () => {
			client.setFilter( { unread: 1 } );
			// A full first window (newest-first, oldest id 200) implies more may exist.
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 209 ), last_seen_time: 0 } );

			expect( client.filteredHasMore ).toBe( true );

			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 1 );
			// Load-more pages a fixed increment older than the oldest loaded note —
			// not a re-request of the whole grown window.
			expect( getCalls[ 0 ].query ).toMatchObject( {
				unread: 1,
				number: 10,
				before: Math.floor( Date.parse( makeNote( 200 ).timestamp ) / 1000 ),
			} );
		} );

		it( 'de-dupes an older unread page that echoes an already-loaded id', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 209 ), last_seen_time: 0 } ); // 209..200
			getCalls.length = 0;

			client.loadMore();
			// The server's inclusive `before` echoes the anchor (200) back alongside
			// genuinely older notes (199..191).
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 200 ), last_seen_time: 0 } );

			// Only the nine genuinely-older ids are appended; the anchor isn't duped.
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 19 );
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

		it( 'pages older unread notes in additively and stops when exhausted', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 209 ), last_seen_time: 0 } ); // 209..200
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 10 );
			expect( client.filteredHasMore ).toBe( true );

			// Page 2: a fixed increment older than the oldest loaded note (200).
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls[ 0 ].query ).toMatchObject( {
				unread: 1,
				number: 10,
				before: Math.floor( Date.parse( makeNote( 200 ).timestamp ) / 1000 ),
			} );
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 199 ), last_seen_time: 0 } ); // 199..190
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 20 );
			expect( client.filteredHasMore ).toBe( true );

			// Page 3: older than the new oldest (190); a short page means exhausted.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls[ 0 ].query ).toMatchObject( {
				unread: 1,
				number: 10,
				before: Math.floor( Date.parse( makeNote( 190 ).timestamp ) / 1000 ),
			} );
			getCalls[ 0 ].callback( null, { notes: fullPage( 5, 189 ), last_seen_time: 0 } ); // 189..185
			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 25 );
			expect( client.filteredHasMore ).toBe( false );

			// No more pages: load-more is a no-op.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 0 );
		} );

		// Reaching the cap with a full page must clear `filteredHasMore`, or the next
		// load-more fires a zero-count request (number = max_limit - 100).
		it( 'stops filtered paging at the cap without a zero-count request', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 209 ), last_seen_time: 0 } );

			// Page in full older pages until the list reaches max_limit (100).
			for ( let oldest = 199; oldest >= 119; oldest -= 10 ) {
				getCalls.length = 0;
				client.loadMore();
				getCalls[ 0 ].callback( null, { notes: fullPage( 10, oldest ), last_seen_time: 0 } );
			}

			expect( getUnreadNoteIds( store.getState() ) ).toHaveLength( 100 );
			expect( client.filteredHasMore ).toBe( false );

			// At the cap, load-more must not fire another request.
			getCalls.length = 0;
			client.loadMore();
			expect( getCalls ).toHaveLength( 0 );
		} );

		// Switching tabs away and back while a load-more is in flight resets the
		// filter; the stale older-page response must not append to the cleared list.
		it( 'discards a stale unread load-more response after a filter reset', () => {
			client.setFilter( { unread: 1 } );
			getCalls[ 0 ].callback( null, { notes: fullPage( 10, 209 ), last_seen_time: 0 } );

			// Start a load-more; capture its still-pending callback.
			getCalls.length = 0;
			client.loadMore();
			const staleCallback = getCalls[ 0 ].callback;

			// User switches to All and back to Unread before it resolves. The fresh
			// fetch is skipped because the in-flight request still holds the lock.
			client.setFilter( null );
			client.setFilter( { unread: 1 } );
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [] );

			// The stale older page lands: it must be dropped, not appended…
			getCalls.length = 0;
			staleCallback( null, { notes: fullPage( 10, 199 ), last_seen_time: 0 } );
			expect( getUnreadNoteIds( store.getState() ) ).toEqual( [] );
			// …and a fresh fetch for the re-selected filter must be kicked off.
			expect( getCalls.find( ( call ) => call.query.unread ) ).toBeTruthy();
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
