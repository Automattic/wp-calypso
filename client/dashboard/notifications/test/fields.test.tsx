/**
 * @jest-environment jsdom
 */
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { getFields, getNoteSender } from '../fields';
import type { Note } from '../engine';
import type { View } from '@wordpress/dataviews';

function makeNote( id: number, overrides: Partial< Note > = {} ): Note {
	return {
		id,
		type: 'comment',
		read: 0,
		noticon: '',
		timestamp: new Date().toISOString(),
		icon: '',
		url: '',
		title: `Note ${ id }`,
		note_hash: id,
		subject: [ { text: `Subject ${ id }` } ],
		body: [],
		...overrides,
	} as Note;
}

describe( 'getNoteSender', () => {
	it( 'reads the sender from the header user range', () => {
		const note = makeNote( 1, {
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
		const note = makeNote( 2, {
			body: [ { text: 'Bob Brown', type: 'user' } ],
		} );
		expect( getNoteSender( note ) ).toBe( 'Bob Brown' );
	} );

	it( 'returns null when no sender is present', () => {
		expect( getNoteSender( makeNote( 3 ) ) ).toBeNull();
	} );
} );

describe( 'search fields', () => {
	const notes = [
		makeNote( 1, {
			subject: [ { text: 'New comment on your post' }, { text: 'Nice article!' } ],
			header: [
				{
					text: 'Alice Adams',
					ranges: [ { type: 'user', indices: [ 0, 11 ], id: 7, parent: null } ],
				},
				{ text: 'Nice article!' },
			],
		} ),
		makeNote( 2, {
			subject: [ { text: 'Bob Brown liked your post' } ],
		} ),
	];
	const fields = getFields();
	const view: View = { type: 'list', fields: [], page: 1, perPage: 20 };

	it( 'matches the sender name', () => {
		const { data } = filterSortAndPaginate( notes, { ...view, search: 'Alice' }, fields );
		expect( data.map( ( note ) => note.id ) ).toEqual( [ 1 ] );
	} );

	it( 'matches the subject text', () => {
		const { data } = filterSortAndPaginate( notes, { ...view, search: 'liked your post' }, fields );
		expect( data.map( ( note ) => note.id ) ).toEqual( [ 2 ] );
	} );

	it( 'matches the excerpt text', () => {
		const { data } = filterSortAndPaginate( notes, { ...view, search: 'Nice article' }, fields );
		expect( data.map( ( note ) => note.id ) ).toEqual( [ 1 ] );
	} );
} );
