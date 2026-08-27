import { getHeaderLink, getNoteExcerpt, getNoteSender, getNoteTitle } from '../summary';
import type { Note } from '../types';

const makeNote = ( overrides: Partial< Note > = {} ): Note =>
	( {
		id: 1,
		type: 'comment',
		read: 0,
		timestamp: '2026-08-27T00:00:00+00:00',
		title: 'Fallback title',
		subject: [ { text: 'Subject' } ],
		body: [],
		...overrides,
	} ) as Note;

describe( 'getNoteTitle / getNoteExcerpt', () => {
	it( 'reads the first subject block, falling back to the title', () => {
		expect( getNoteTitle( makeNote() ) ).toBe( 'Subject' );
		expect( getNoteTitle( makeNote( { subject: [] } ) ) ).toBe( 'Fallback title' );
	} );

	it( 'treats the second subject block as the excerpt', () => {
		expect( getNoteExcerpt( makeNote() ) ).toBeNull();
		expect( getNoteExcerpt( makeNote( { subject: [ { text: 'A' }, { text: 'B' } ] } ) ) ).toBe(
			'B'
		);
	} );
} );

describe( 'getNoteSender', () => {
	it( 'reads the sender from the header user range', () => {
		const note = makeNote( {
			header: [
				{
					text: 'Alice Adams',
					ranges: [ { type: 'user', indices: [ 0, 11 ], id: 7, parent: null } ],
				},
				{ text: 'A snippet' },
			],
		} );
		expect( getNoteSender( note ) ).toBe( 'Alice Adams' );
	} );

	it( 'falls back to the body user block', () => {
		expect( getNoteSender( makeNote( { body: [ { text: 'Bob Brown', type: 'user' } ] } ) ) ).toBe(
			'Bob Brown'
		);
	} );

	it( 'returns null when no sender is present', () => {
		expect( getNoteSender( makeNote() ) ).toBeNull();
	} );
} );

describe( 'getHeaderLink', () => {
	it( 'links a user range to the Reader profile when its id is not the site id', () => {
		expect(
			getHeaderLink( {
				text: 'Alice',
				ranges: [
					{ type: 'user', indices: [ 0, 5 ], id: 7, site_id: 3, parent: null, url: 'https://x' },
				],
			} )
		).toBe( 'https://wordpress.com/reader/users/id/7' );
	} );

	it( 'falls back to the range url otherwise', () => {
		expect(
			getHeaderLink( {
				text: 'Site',
				ranges: [
					{ type: 'user', indices: [ 0, 4 ], id: 3, site_id: 3, parent: null, url: 'https://x' },
				],
			} )
		).toBe( 'https://x' );
		expect( getHeaderLink( { text: 'None' } ) ).toBeUndefined();
	} );
} );
