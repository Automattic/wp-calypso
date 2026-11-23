/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { reportError, reportRequestError } from '../../../../helpers/log-error';
import { addTracksSurface } from '../../../../helpers/stats';
import { init as initWpcom } from '../../../../rest-client/wpcom';
import { store, init as initState } from '../../../../state';
import actions from '../../../actions';
import getIsNoteRead from '../../../selectors/get-is-note-read';
import markAllRead from '../mark-all-read';

vi.mock( '../../../../helpers/log-error', () => ( {
	reportError: vi.fn(),
	reportRequestError: vi.fn(),
} ) );

const makeNote = ( id, timestamp, read = 0 ) => ( {
	id,
	type: 'comment',
	read,
	timestamp,
	subject: [ { text: `note ${ id }` } ],
	note_hash: `hash-${ id }`,
} );

const older = makeNote( 1, '2026-06-01T00:00:00+00:00' );
const alreadyRead = makeNote( 2, '2026-06-02T00:00:00+00:00', 1 );
const newest = makeNote( 3, '2026-06-03T00:00:00+00:00' );
const NEWEST_TIME = Date.parse( newest.timestamp ) / 1000;

describe( 'markAllRead', () => {
	let postCalls;
	let respond;
	let restClient;

	const isRead = ( note ) => getIsNoteRead( store.getState(), note );
	const storedStatus = ( note ) => localStorage.getItem( `note_read_status_${ note.id }` );

	beforeEach( () => {
		localStorage.clear();
		window._tkq = [];
		vi.mocked( reportError ).mockClear();
		vi.mocked( reportRequestError ).mockClear();

		// The redux store is a shared singleton; re-init it so each test starts empty.
		initState();

		postCalls = [];
		initWpcom( {
			req: {
				post: ( { path }, query, body ) => {
					postCalls.push( { path, query, body } );
					return new Promise( ( resolve, reject ) => {
						respond = { resolve, reject };
					} );
				},
			},
		} );
		restClient = { refreshFilteredNotes: vi.fn() };

		store.dispatch( actions.notes.addNotes( [ older, alreadyRead, newest ] ) );
	} );

	it( 'asks the server to mark everything up to the newest loaded note, and sends nothing else', () => {
		store.dispatch( markAllRead( restClient ) );

		expect( postCalls ).toEqual( [
			{ path: '/notifications/read/all', query: null, body: { time: NEWEST_TIME } },
		] );
	} );

	it( 'leaves the notes unread until the server answers', () => {
		store.dispatch( markAllRead( restClient ) );

		expect( isRead( older ) ).toBe( false );
		expect( isRead( newest ) ).toBe( false );
	} );

	it( 'shows the loaded notes as read once the server confirms', async () => {
		const marking = store.dispatch( markAllRead( restClient ) );
		respond.resolve( { success: true, count: 40 } );

		await expect( marking ).resolves.toBe( true );
		expect( isRead( older ) ).toBe( true );
		expect( isRead( newest ) ).toBe( true );
		expect( storedStatus( older ) ).toBe( '1' );
		expect( storedStatus( newest ) ).toBe( '1' );
		expect( storedStatus( alreadyRead ) ).toBeNull();
		expect( restClient.refreshFilteredNotes ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'marks a note as read that was marked as unread on this device', async () => {
		store.dispatch( actions.notes.unreadNote( alreadyRead.id ) );
		localStorage.setItem( `note_read_status_${ alreadyRead.id }`, '0' );

		const marking = store.dispatch( markAllRead( restClient ) );
		respond.resolve( { success: true, count: 3 } );
		await marking;

		expect( isRead( alreadyRead ) ).toBe( true );
		expect( storedStatus( alreadyRead ) ).toBe( '1' );
	} );

	it( 'keeps a note unread when it arrives while the request is in flight', async () => {
		const arrived = makeNote( 4, '2026-06-04T00:00:00+00:00' );
		const marking = store.dispatch( markAllRead( restClient ) );

		store.dispatch( actions.notes.addNotes( [ arrived ] ) );
		respond.resolve( { success: true, count: 2 } );
		await marking;

		expect( isRead( arrived ) ).toBe( false );
		expect( isRead( newest ) ).toBe( true );
	} );

	it( 'records how many notes the server marked', async () => {
		const marking = store.dispatch( markAllRead( restClient ) );
		respond.resolve( { success: true, count: 40 } );
		await marking;

		expect( window._tkq ).toEqual( [
			[ 'recordEvent', 'calypso_notification_mark_all_read', { count: 40 } ],
		] );
	} );

	it( 'names the surface shown when the person confirmed, even if it has closed since', async () => {
		const removePanel = addTracksSurface( 'dashboard_panel' );
		const marking = store.dispatch( markAllRead( restClient ) );
		removePanel();
		respond.resolve( { success: true, count: 40 } );
		await marking;

		expect( window._tkq ).toEqual( [
			[
				'recordEvent',
				'calypso_notification_mark_all_read',
				{ surface: 'dashboard_panel', count: 40 },
			],
		] );
	} );

	it.each( [
		[ 'the request fails', ( error ) => respond.reject( error ), reportRequestError ],
		[ 'the server refuses it', ( error ) => respond.resolve( error ), reportError ],
	] )( 'leaves the notes unread when %s', async ( _name, answer, report ) => {
		const failure = { success: false, status: 500 };
		const marking = store.dispatch( markAllRead( restClient ) );
		answer( failure );

		await expect( marking ).resolves.toBe( false );
		expect( isRead( older ) ).toBe( false );
		expect( isRead( newest ) ).toBe( false );
		expect( storedStatus( newest ) ).toBeNull();
		expect( restClient.refreshFilteredNotes ).not.toHaveBeenCalled();
		expect( window._tkq ).toEqual( [] );
		expect( report ).toHaveBeenCalledWith( 'read-all', failure );
	} );

	it( 'sends nothing when no notes are loaded', async () => {
		initState();

		await expect( store.dispatch( markAllRead( restClient ) ) ).resolves.toBe( false );
		expect( postCalls ).toEqual( [] );
	} );
} );
