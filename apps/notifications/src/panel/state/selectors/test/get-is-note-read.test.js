/**
 * @vitest-environment jsdom
 */
import { getIsNoteRead } from '../get-is-note-read';

const STORAGE_KEY = 'note_read_status_5';

describe( 'getIsNoteRead', () => {
	beforeEach( () => {
		localStorage.clear();
	} );

	it( 'uses the read flag from the server when nothing is stored locally', () => {
		expect( getIsNoteRead( { noteReads: {} }, { id: 5, read: 1 } ) ).toBe( true );
		expect( getIsNoteRead( { noteReads: {} }, { id: 5, read: 0 } ) ).toBe( false );
	} );

	it( 'treats a note stored as read as read', () => {
		localStorage.setItem( STORAGE_KEY, '1' );

		expect( getIsNoteRead( { noteReads: {} }, { id: 5, read: 0 } ) ).toBe( true );
	} );

	it( 'treats a note stored as unread as unread', () => {
		localStorage.setItem( STORAGE_KEY, '0' );

		expect( getIsNoteRead( { noteReads: {} }, { id: 5, read: 1 } ) ).toBe( false );
	} );

	it( 'prefers the status set in this session over the stored one', () => {
		localStorage.setItem( STORAGE_KEY, '1' );

		expect( getIsNoteRead( { noteReads: { 5: false } }, { id: 5, read: 1 } ) ).toBe( false );
	} );
} );
