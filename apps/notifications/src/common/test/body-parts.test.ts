import { getNoteBodyParts, getNoteUserRef, getSignature } from '../body-parts';
import type { Note } from '../types';

const makeNote = ( overrides: Partial< Note > = {} ): Note =>
	( {
		id: 1,
		type: 'comment',
		read: 0,
		timestamp: '2026-08-27T00:00:00+00:00',
		title: 'Title',
		subject: [ { text: 'Subject' } ],
		body: [],
		...overrides,
	} ) as Note;

describe( 'getNoteBodyParts', () => {
	it( 'splits around the comment block, returning the full classification', () => {
		const parts = getNoteBodyParts(
			makeNote( {
				body: [
					{ text: 'Alice Adams', type: 'user' },
					{ text: 'On the post: Hello world', type: 'post' },
					{ text: 'Great write-up!', type: 'comment' },
					{ text: 'You replied to this comment.' },
				],
			} )
		);
		expect( parts.comment?.text ).toBe( 'Great write-up!' );
		// User blocks are kept here — any header-covers-the-sender filtering is
		// the consuming shell's presentation decision.
		expect( parts.context.map( ( block ) => block.text ) ).toEqual( [
			'Alice Adams',
			'On the post: Hello world',
		] );
		expect( parts.postscript.map( ( block ) => block.text ) ).toEqual( [
			'You replied to this comment.',
		] );
	} );

	it( 'keeps everything as context when there is no comment', () => {
		const parts = getNoteBodyParts(
			makeNote( {
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
		const parts = getNoteBodyParts( makeNote( { body: [ { text: '  ' } ] } ) );
		expect( parts.context ).toEqual( [] );
		expect( parts.comment ).toBeNull();
	} );
} );

describe( 'getSignature', () => {
	it( 'classifies blocks by type, ids, and the reply range', () => {
		const note = makeNote( { meta: { ids: { site: 7, comment: 9, reply_comment: 33 } } } );
		const signatures = getSignature(
			[
				{ text: 'plain' },
				{ text: 'a comment', meta: { ids: { comment: 9 } } },
				{ text: 'a post', meta: { ids: { post: 5 } } },
				{ text: 'a user', meta: { ids: { user: 4 } } },
				{
					text: 'your reply',
					ranges: [
						{ type: 'b', indices: [ 0, 1 ], id: 1, parent: null },
						{ type: 'comment', indices: [ 0, 1 ], id: 33, parent: null },
					],
				},
			],
			note
		);
		expect( signatures ).toEqual( [
			{ type: 'text', id: null },
			{ type: 'comment', id: 9 },
			{ type: 'post', id: 5 },
			{ type: 'user', id: 4 },
			{ type: 'reply', id: 33 },
		] );
	} );

	it( 'returns an empty list for empty input', () => {
		expect( getSignature( [], makeNote() ) ).toEqual( [] );
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
			siteId: null,
			isFollowing: false,
			canFollow: false,
			homeTitle: null,
			homeUrl: null,
		} );
	} );

	it( 'exposes follow state and home site from the block meta', () => {
		expect(
			getNoteUserRef( {
				text: 'Bob',
				actions: { follow: true },
				meta: {
					ids: { site: 99, user: 5 },
					links: { home: 'https://blog.example/' },
					titles: { home: 'My Blog' },
				},
			} )
		).toEqual( {
			name: 'Bob',
			avatarUrl: null,
			url: 'https://blog.example/',
			siteId: 99,
			isFollowing: true,
			canFollow: true,
			homeTitle: 'My Blog',
			homeUrl: 'https://blog.example/',
		} );
	} );

	it( 'falls back to nulls without media or ranges', () => {
		expect( getNoteUserRef( { text: 'Bob' } ) ).toEqual( {
			name: 'Bob',
			avatarUrl: null,
			url: null,
			siteId: null,
			isFollowing: false,
			canFollow: false,
			homeTitle: null,
			homeUrl: null,
		} );
	} );
} );
