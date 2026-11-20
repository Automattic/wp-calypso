import { getNoteIds, noteText, withFirstNoteId } from '../note-metadata';

describe( 'getNoteIds', () => {
	it( 'reads a single number', () => {
		expect( getNoteIds( { noteId: 12 } ) ).toEqual( [ 12 ] );
	} );

	it( 'reads an array, keeping positive numbers once in order', () => {
		expect( getNoteIds( { noteId: [ 3, '4', 3, 0, -1, 'x' ] } ) ).toEqual( [ 3, 4 ] );
	} );

	it( 'returns an empty list without metadata', () => {
		expect( getNoteIds( undefined ) ).toEqual( [] );
	} );
} );

describe( 'withFirstNoteId', () => {
	it( 'adds the note id to the metadata', () => {
		expect( withFirstNoteId( { name: 'Intro' }, 7 ) ).toEqual( { name: 'Intro', noteId: 7 } );
	} );
} );

describe( 'noteText', () => {
	it( 'prefers trimmed raw content', () => {
		expect( noteText( { raw: ' Hi ' } ) ).toBe( 'Hi' );
	} );

	it( 'strips tags and decodes entities from rendered content', () => {
		expect( noteText( { rendered: '<p>A &amp; B</p>' } ) ).toBe( 'A & B' );
	} );
} );
