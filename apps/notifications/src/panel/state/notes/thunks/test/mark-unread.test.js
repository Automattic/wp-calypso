/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { reportError, reportRequestError } from '../../../../helpers/log-error';
import { init as initWpcom } from '../../../../rest-client/wpcom';
import { store, init as initState } from '../../../../state';
import actions from '../../../actions';
import getIsNoteRead from '../../../selectors/get-is-note-read';
import markUnread from '../mark-unread';

vi.mock( '../../../../helpers/log-error', () => ( {
	reportError: vi.fn(),
	reportRequestError: vi.fn(),
} ) );

const note = {
	id: 5,
	type: 'comment',
	read: 1,
	timestamp: '2026-06-01T00:00:00.000Z',
	subject: [ { text: 'note 5' } ],
	note_hash: 'hash-5',
};

const STORAGE_KEY = `note_read_status_${ note.id }`;

describe( 'markUnread', () => {
	let postCalls;
	let restClient;

	const isRead = () => getIsNoteRead( store.getState(), note );
	const lastPost = () => postCalls[ postCalls.length - 1 ];

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
				post: ( { path }, _query, body, callback ) => postCalls.push( { path, body, callback } ),
			},
		} );
		restClient = { refreshFilteredNotes: vi.fn() };

		store.dispatch( actions.notes.addNotes( [ note ] ) );
	} );

	it( 'shows the note as unread before the server answers', () => {
		expect( isRead() ).toBe( true );

		store.dispatch( markUnread( note, restClient ) );

		expect( isRead() ).toBe( false );
		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( '0' );
	} );

	it( 'asks the server to mark the note as unread', () => {
		store.dispatch( markUnread( note, restClient ) );

		expect( postCalls ).toHaveLength( 1 );
		expect( lastPost() ).toMatchObject( {
			path: '/notifications/read',
			body: { counts: { [ note.id ]: -1 } },
		} );
	} );

	it( 'records a Tracks event with the note type', () => {
		store.dispatch( markUnread( note, restClient ) );

		expect( window._tkq ).toEqual( [
			[ 'recordEvent', 'calypso_notification_note_unread', { note_type: 'comment' } ],
		] );
	} );

	it( 'refreshes the filtered list once the server confirms', () => {
		store.dispatch( markUnread( note, restClient ) );
		expect( restClient.refreshFilteredNotes ).not.toHaveBeenCalled();

		lastPost().callback( null, { success: true, updated: [ note.id ] } );

		expect( restClient.refreshFilteredNotes ).toHaveBeenCalledTimes( 1 );
		expect( isRead() ).toBe( false );
	} );

	it.each( [
		[ 'lists the note id as a string', { success: true, updated: [ String( note.id ) ] } ],
		[ 'sends no list of updated notes', { success: true } ],
	] )( 'takes it as confirmed when the server %s', ( _name, response ) => {
		store.dispatch( markUnread( note, restClient ) );

		lastPost().callback( null, response );

		expect( isRead() ).toBe( false );
		expect( reportError ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'the request fails', [ new Error( 'offline' ), undefined ], reportRequestError ],
		[ 'the server rejects it', [ null, { success: false } ], reportError ],
		[ 'the server leaves the note as read', [ null, { success: true, updated: [] } ], reportError ],
	] )( 'restores the read state when %s', ( _name, response, report ) => {
		store.dispatch( markUnread( note, restClient ) );

		lastPost().callback( ...response );

		expect( isRead() ).toBe( true );
		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( '1' );
		expect( restClient.refreshFilteredNotes ).not.toHaveBeenCalled();
		expect( report ).toHaveBeenCalledWith( 'unread', response[ 0 ] ?? response[ 1 ] );
		expect( report === reportError ? reportRequestError : reportError ).not.toHaveBeenCalled();
	} );

	it( 'marks the note as read again when it is reopened', () => {
		store.dispatch( markUnread( note, restClient ) );
		lastPost().callback( null, { success: true } );

		store.dispatch( actions.ui.selectNote( note.id ) );

		expect( isRead() ).toBe( true );
		expect( lastPost().body ).toEqual( { counts: { [ note.id ]: 9999 } } );
	} );

	it( 'stays unread when an earlier mark-as-read request answers late', () => {
		const unreadNote = { ...note, id: 6, read: 0, note_hash: 'hash-6' };
		store.dispatch( actions.notes.addNotes( [ unreadNote ] ) );

		// Opening the note sends the mark-as-read request.
		store.dispatch( actions.ui.selectNote( unreadNote.id ) );
		const markReadRequest = lastPost();

		store.dispatch( markUnread( unreadNote, restClient ) );
		markReadRequest.callback( null, { success: true } );

		expect( getIsNoteRead( store.getState(), unreadNote ) ).toBe( false );
		expect( localStorage.getItem( `note_read_status_${ unreadNote.id }` ) ).toBe( '0' );
	} );

	it( 'waits for an earlier mark-as-read request before asking for unread', () => {
		const unreadNote = { ...note, id: 6, read: 0, note_hash: 'hash-6' };
		store.dispatch( actions.notes.addNotes( [ unreadNote ] ) );

		store.dispatch( actions.ui.selectNote( unreadNote.id ) );
		store.dispatch( markUnread( unreadNote, restClient ) );

		expect( postCalls ).toHaveLength( 1 );
		expect( lastPost().body ).toEqual( { counts: { [ unreadNote.id ]: 9999 } } );

		lastPost().callback( null, { success: true } );

		expect( postCalls ).toHaveLength( 2 );
		expect( lastPost().body ).toEqual( { counts: { [ unreadNote.id ]: -1 } } );
	} );
} );
