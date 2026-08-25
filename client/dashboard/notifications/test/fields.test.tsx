/**
 * @jest-environment jsdom
 */
import { filterSortAndPaginate } from '@wordpress/dataviews';
import {
	getBlockSegments,
	getFields,
	getNoteBodyParts,
	getNoteSender,
	getNoteUserRef,
	getTitleSegments,
} from '../fields';
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

describe( 'getNoteBodyParts', () => {
	it( 'quotes the comment block and drops the redundant user block', () => {
		const parts = getNoteBodyParts(
			makeNote( 1, {
				body: [
					{ text: 'Alice Adams', type: 'user' },
					{ text: 'On the post: Hello world', type: 'post' },
					{ text: 'Great write-up!\n\nThanks for sharing.', type: 'comment' },
				],
			} )
		);
		expect( parts.comment?.text ).toBe( 'Great write-up!\n\nThanks for sharing.' );
		expect( parts.context.map( ( block ) => block.text ) ).toEqual( [
			'On the post: Hello world',
		] );
	} );

	it( 'keeps user blocks as context when there is no comment', () => {
		const parts = getNoteBodyParts(
			makeNote( 2, {
				body: [
					{ text: 'Alice Adams', type: 'user' },
					{ text: 'Bob Brown', type: 'user' },
				],
			} )
		);
		expect( parts.comment ).toBeNull();
		expect( parts.context.map( ( block ) => block.text ) ).toEqual( [
			'Alice Adams',
			'Bob Brown',
		] );
	} );

	it( 'ignores empty blocks', () => {
		const parts = getNoteBodyParts( makeNote( 3, { body: [ { text: '  ' } ] } ) );
		expect( parts.context ).toEqual( [] );
		expect( parts.comment ).toBeNull();
	} );
} );

describe( 'getTitleSegments', () => {
	it( 'bolds the user and post ranges only', () => {
		const note = makeNote( 1, {
			subject: [
				{
					text: 'Aras mentioned you on Deep links',
					ranges: [
						{ type: 'user', indices: [ 0, 4 ], id: 1, parent: null },
						{ type: 'post', indices: [ 22, 32 ], id: 2, parent: null },
					],
				},
			],
		} );
		expect( getTitleSegments( note ) ).toEqual( [
			{ text: 'Aras', bold: true },
			{ text: ' mentioned you on ', bold: false },
			{ text: 'Deep links', bold: true },
		] );
	} );

	it( 'returns one plain segment without ranges', () => {
		expect( getTitleSegments( makeNote( 2 ) ) ).toEqual( [ { text: 'Subject 2', bold: false } ] );
	} );
} );

describe( 'getNoteUserRef', () => {
	it( 'pulls name, avatar, and profile link from a user block', () => {
		expect(
			getNoteUserRef( {
				text: 'Ian Stewart',
				media: [ { type: 'image', url: 'https://example.com/a.jpg', indices: [ 0, 0 ] } ],
				ranges: [
					{
						type: 'user',
						indices: [ 0, 11 ],
						id: 1,
						parent: null,
						url: 'https://example.com/ian',
					},
				],
			} )
		).toEqual( {
			name: 'Ian Stewart',
			avatarUrl: 'https://example.com/a.jpg',
			url: 'https://example.com/ian',
		} );
	} );

	it( 'falls back to nulls without media or ranges', () => {
		expect( getNoteUserRef( { text: 'Bob' } ) ).toEqual( {
			name: 'Bob',
			avatarUrl: null,
			url: null,
		} );
	} );
} );

describe( 'getBlockSegments', () => {
	it( 'splits text into plain and linked segments', () => {
		const segments = getBlockSegments( {
			text: 'New achievement! See all your achievements.',
			ranges: [
				{
					type: 'link',
					indices: [ 17, 42 ],
					url: 'https://wordpress.com/me/achievements',
					id: 1,
					parent: null,
				},
			],
		} );
		expect( segments ).toEqual( [
			{ text: 'New achievement! ' },
			{ text: 'See all your achievements', url: 'https://wordpress.com/me/achievements' },
			{ text: '.' },
		] );
	} );

	it( 'returns the whole text when there are no linkable ranges', () => {
		const segments = getBlockSegments( {
			text: 'Just text',
			ranges: [ { type: 'b', indices: [ 0, 4 ], id: 2, parent: null } ],
		} );
		expect( segments ).toEqual( [ { text: 'Just text' } ] );
	} );

	it( 'drops overlapping and out-of-bounds ranges', () => {
		const segments = getBlockSegments( {
			text: 'abcdef',
			ranges: [
				{ type: 'link', indices: [ 0, 4 ], url: 'https://a.example', id: 3, parent: null },
				{ type: 'link', indices: [ 2, 6 ], url: 'https://b.example', id: 4, parent: null },
				{ type: 'link', indices: [ 5, 9 ], url: 'https://c.example', id: 5, parent: null },
			],
		} );
		expect( segments ).toEqual( [ { text: 'abcd', url: 'https://a.example' }, { text: 'ef' } ] );
	} );
} );
