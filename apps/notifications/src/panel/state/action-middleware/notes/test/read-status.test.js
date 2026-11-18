/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { init as initWpcom } from '../../../../rest-client/wpcom';
import { store, init as initState } from '../../../../state';
import actions from '../../../actions';
import { markUnread } from '../../../notes/thunks';
import getIsNoteRead from '../../../selectors/get-is-note-read';
import getNote from '../../../selectors/get-note';

const note = {
	id: 5,
	type: 'comment',
	read: 1,
	timestamp: '2026-06-01T00:00:00.000Z',
	subject: [ { text: 'note 5' } ],
	note_hash: 'hash-5',
};

const HOLD_MS = 10000;

describe( 'read status from the server after marking a note as unread', () => {
	let postCalls;

	const isRead = () => getIsNoteRead( store.getState(), getNote( store.getState(), note.id ) );
	const receiveFromServer = ( read ) =>
		store.dispatch( actions.notes.addNotes( [ { ...note, read } ] ) );
	const answerLastPost = () =>
		postCalls[ postCalls.length - 1 ].callback( null, { success: true, updated: [ note.id ] } );

	beforeEach( () => {
		vi.useFakeTimers();
		localStorage.clear();
		window._tkq = [];

		// The redux store is a shared singleton; re-init it so each test starts empty.
		initState();

		postCalls = [];
		initWpcom( {
			req: {
				post: ( { path }, _query, body, callback ) => postCalls.push( { path, body, callback } ),
			},
		} );

		store.dispatch( actions.notes.addNotes( [ note ] ) );
		store.dispatch( markUnread( note ) );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	it( 'keeps the note unread when an older copy arrives right after', () => {
		answerLastPost();

		receiveFromServer( 1 );

		expect( isRead() ).toBe( false );
	} );

	it( 'keeps the note unread while the request is still pending', () => {
		vi.advanceTimersByTime( HOLD_MS + 1 );

		receiveFromServer( 1 );

		expect( isRead() ).toBe( false );
	} );

	it( 'shows the note as read once the server says so later on', () => {
		answerLastPost();
		vi.advanceTimersByTime( HOLD_MS + 1 );

		receiveFromServer( 1 );

		expect( isRead() ).toBe( true );
	} );

	it( 'keeps the note unread when the server still has it as unread', () => {
		answerLastPost();
		vi.advanceTimersByTime( HOLD_MS + 1 );

		receiveFromServer( 0 );

		expect( isRead() ).toBe( false );
	} );

	it( 'keeps the note unread when other notes arrive', () => {
		answerLastPost();
		vi.advanceTimersByTime( HOLD_MS + 1 );

		store.dispatch( actions.notes.addNotes( [ { ...note, id: 6, note_hash: 'hash-6' } ] ) );

		expect( isRead() ).toBe( false );
	} );

	it( 'holds again when another tab marks the note as unread', () => {
		answerLastPost();
		vi.advanceTimersByTime( HOLD_MS + 1 );
		store.dispatch( actions.notes.unreadNote( note.id ) );

		receiveFromServer( 1 );

		expect( isRead() ).toBe( false );
	} );

	it( 'leaves a note marked as read here alone', () => {
		answerLastPost();
		store.dispatch( actions.ui.selectNote( note.id ) );
		answerLastPost();
		vi.advanceTimersByTime( HOLD_MS + 1 );

		receiveFromServer( 0 );

		expect( isRead() ).toBe( true );
	} );
} );
