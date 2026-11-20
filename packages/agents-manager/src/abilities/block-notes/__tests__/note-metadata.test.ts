import {
	getNoteIds,
	noteBlockRefusal,
	noteText,
	toPostRef,
	withFirstNoteId,
} from '../note-metadata';

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

	it( 'decodes entities in raw content', () => {
		expect( noteText( { raw: 'a &lt;h3&gt; &amp; b' } ) ).toBe( 'a <h3> & b' );
	} );

	it( 'strips tags and decodes entities from rendered content', () => {
		expect( noteText( { rendered: '<p>A &amp; B</p>' } ) ).toBe( 'A & B' );
	} );
} );

describe( 'toPostRef', () => {
	it( 'accepts a positive integer id, also as a string', () => {
		expect( toPostRef( 12, 'draft' ) ).toBe( 12 );
		expect( toPostRef( '12', 'publish' ) ).toBe( 12 );
	} );

	it( 'flags an auto-draft', () => {
		expect( toPostRef( 12, 'auto-draft' ) ).toBe( 'auto-draft' );
	} );

	it( 'flags a template id as unsupported', () => {
		expect( toPostRef( 'twentytwentyfour//home', undefined ) ).toBe( 'unsupported' );
		expect( toPostRef( 0, undefined ) ).toBe( 'unsupported' );
	} );

	it( 'returns undefined without an id', () => {
		expect( toPostRef( undefined, undefined ) ).toBeUndefined();
	} );
} );

describe( 'noteBlockRefusal', () => {
	const ok = { name: 'core/paragraph', editingMode: 'default', hasReusableParent: false };

	it( 'allows an ordinary block', () => {
		expect( noteBlockRefusal( ok ) ).toBeNull();
	} );

	it.each( [
		[ 'a disabled editing mode', { ...ok, editingMode: 'disabled' } ],
		[ 'a template part or synced pattern ancestor', { ...ok, hasReusableParent: true } ],
		[ 'a template part', { ...ok, name: 'core/template-part' } ],
		[ 'a synced pattern', { ...ok, name: 'core/block' } ],
		[ 'a classic block', { ...ok, name: 'core/freeform' } ],
	] )( 'refuses %s', ( _label, block ) => {
		expect( noteBlockRefusal( block ) ).toMatch( /belong to the open post/ );
	} );
} );
