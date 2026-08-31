import {
	getNoteBodyParts,
	getNoteLikedComment,
	getNoteParentComment,
	getNoteUserRef,
	getSignature,
} from '../body-parts';
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

describe( 'getNoteParentComment', () => {
	const replyNote = ( overrides: Partial< Note > = {} ) =>
		makeNote( {
			url: 'https://example.com/post',
			meta: { ids: { parent_comment: 42 } },
			header: [
				{
					text: 'Rob Pugh on A look into notifications',
					ranges: [
						{ type: 'user', indices: [ 0, 8 ], id: 7, parent: null },
						{ type: 'post', indices: [ 12, 37 ], id: 9, parent: null },
					],
					media: [ { type: 'image', indices: [ 0, 0 ], url: 'https://example.com/rob.jpg' } ],
				},
				{ text: 'And should we consider some kind of alert' },
			],
			...overrides,
		} );

	it( 'reads the parent comment from the note header', () => {
		const parent = getNoteParentComment( replyNote() );
		expect( parent?.author.text ).toBe( 'Rob Pugh on A look into notifications' );
		expect( parent?.excerpt.text ).toBe( 'And should we consider some kind of alert' );
		expect( parent?.avatarUrl ).toBe( 'https://example.com/rob.jpg' );
	} );

	it( 'anchors the link to the parent comment', () => {
		expect( getNoteParentComment( replyNote() )?.url ).toBe(
			'https://example.com/post#comment-42'
		);
	} );

	it( 'replaces an existing fragment rather than appending one', () => {
		const parent = getNoteParentComment(
			replyNote( { url: 'https://example.com/post#comment-99' } )
		);
		expect( parent?.url ).toBe( 'https://example.com/post#comment-42' );
	} );

	it( 'drops the header media so the avatar is not rendered twice', () => {
		expect( getNoteParentComment( replyNote() )?.author.media ).toBeUndefined();
	} );

	it( 'returns null when the note is not a reply', () => {
		expect( getNoteParentComment( replyNote( { meta: { ids: {} } } ) ) ).toBeNull();
	} );

	it( 'returns null when the header has no excerpt to show', () => {
		const note = replyNote();
		expect(
			getNoteParentComment( makeNote( { ...note, header: [ note.header![ 0 ] ] } ) )
		).toBeNull();
	} );

	it( 'returns null when the header does not lead with a user', () => {
		const note = replyNote();
		expect(
			getNoteParentComment(
				makeNote( {
					...note,
					header: [ { text: 'A site', ranges: [] }, note.header![ 1 ] ],
				} )
			)
		).toBeNull();
	} );
} );

describe( 'getNoteLikedComment', () => {
	const likeNote = ( overrides: Partial< Note > = {} ) =>
		makeNote( {
			type: 'comment_like',
			header: [
				{
					text: 'Alice Adams',
					ranges: [ { type: 'user', indices: [ 0, 11 ], id: 7, parent: null } ],
				},
				{ text: 'The comment they liked' },
			],
			...overrides,
		} );

	it( 'reads the liked comment from the note header', () => {
		expect( getNoteLikedComment( likeNote() )?.text ).toBe( 'The comment they liked' );
	} );

	it( 'ignores post likes, whose header snippet is the post title', () => {
		expect( getNoteLikedComment( likeNote( { type: 'like' } ) ) ).toBeNull();
	} );

	it( 'ignores other note types', () => {
		expect( getNoteLikedComment( likeNote( { type: 'comment' } ) ) ).toBeNull();
	} );

	it( 'returns null when the header carries no comment', () => {
		const note = likeNote();
		expect(
			getNoteLikedComment( makeNote( { ...note, header: [ note.header![ 0 ] ] } ) )
		).toBeNull();
		expect(
			getNoteLikedComment( makeNote( { ...note, header: [ note.header![ 0 ], { text: '  ' } ] } ) )
		).toBeNull();
	} );
} );
