/**
 * @jest-environment jsdom
 */
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { getFields, getNoteBodyParts } from '../fields';
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
		expect( parts.postscript ).toEqual( [] );
	} );

	it( 'keeps blocks after the comment below it', () => {
		const parts = getNoteBodyParts(
			makeNote( 4, {
				body: [
					{ text: 'On the post: Hello world', type: 'post' },
					{ text: 'A sharp observation.', type: 'comment' },
					{ text: 'You replied to this comment.' },
				],
			} )
		);
		expect( parts.context.map( ( block ) => block.text ) ).toEqual( [
			'On the post: Hello world',
		] );
		expect( parts.postscript.map( ( block ) => block.text ) ).toEqual( [
			'You replied to this comment.',
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
