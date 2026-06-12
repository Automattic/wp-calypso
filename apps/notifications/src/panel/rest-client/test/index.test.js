/**
 * @jest-environment jsdom
 */
import { store } from '../../state';
import actions from '../../state/actions';
import getAllNotes from '../../state/selectors/get-all-notes';
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

describe( 'RestClient load-more pagination', () => {
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
