/**
 * @jest-environment jsdom
 */
import {
	getBlockSegments,
	getNoteBodyParts,
	getNoteSender,
	getNoteUserRef,
	getTitleSegments,
} from '../fields';
import type { Note } from '../engine';

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

	it( 'keeps the user block on replies, whose header shows the comment answered', () => {
		const parts = getNoteBodyParts(
			makeNote( 5, {
				url: 'https://example.com/post',
				meta: { ids: { parent_comment: 42 } },
				header: [
					{
						text: 'Rob Pugh on A look into notifications',
						ranges: [ { type: 'user', indices: [ 0, 8 ], id: 7, parent: null } ],
					},
					{ text: 'The original comment' },
				],
				body: [
					{ text: 'Dennis Snell', type: 'user' },
					{ text: 'The reply', type: 'comment' },
				],
			} )
		);
		expect( parts.context.map( ( block ) => block.text ) ).toEqual( [ 'Dennis Snell' ] );
		expect( parts.comment?.text ).toBe( 'The reply' );
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

describe( 'getTitleSegments', () => {
	it( 'bolds the user and post ranges and carries their links', () => {
		const note = makeNote( 1, {
			subject: [
				{
					text: 'Aras mentioned you on Deep links',
					ranges: [
						{
							type: 'user',
							indices: [ 0, 4 ],
							id: 1,
							parent: null,
							url: 'https://example.com/aras',
						},
						{ type: 'post', indices: [ 22, 32 ], id: 2, parent: null },
					],
				},
			],
		} );
		expect( getTitleSegments( note ) ).toEqual( [
			{ text: 'Aras', bold: true, url: 'https://example.com/aras' },
			{ text: ' mentioned you on ', bold: false, url: null },
			{ text: 'Deep links', bold: true, url: null },
		] );
	} );

	it( 'returns one plain segment without ranges', () => {
		expect( getTitleSegments( makeNote( 2 ) ) ).toEqual( [
			{ text: 'Subject 2', bold: false, url: null },
		] );
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
			{
				text: 'See all your achievements',
				type: 'link',
				url: 'https://wordpress.com/me/achievements',
			},
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
		expect( segments ).toEqual( [
			{ text: 'abcd', type: 'link', url: 'https://a.example' },
			{ text: 'ef' },
		] );
	} );
} );
