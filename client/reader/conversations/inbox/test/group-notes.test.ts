import { getConversationKey, groupNotesByPost } from '../group-notes';
import { makeNote } from './helpers';

const minutesAgo = ( minutes: number ) => new Date( Date.now() - minutes * 60_000 ).toISOString();

describe( 'groupNotesByPost', () => {
	it( 'groups notes on the same post into one conversation', () => {
		const conversations = groupNotesByPost( [
			makeNote( { id: 1, siteId: 10, postId: 100 } ),
			makeNote( { id: 2, siteId: 10, postId: 100 } ),
			makeNote( { id: 3, siteId: 10, postId: 200 } ),
		] );

		expect( conversations ).toHaveLength( 2 );
		expect( conversations.map( ( { key } ) => key ).sort() ).toEqual( [ '10-100', '10-200' ] );
		expect( conversations.find( ( { postId } ) => postId === 100 )?.noteIds.sort() ).toEqual( [
			1, 2,
		] );
	} );

	it( 'orders conversations by their most recent note', () => {
		const conversations = groupNotesByPost( [
			makeNote( { id: 1, postId: 100, timestamp: minutesAgo( 30 ) } ),
			makeNote( { id: 2, postId: 200, timestamp: minutesAgo( 5 ) } ),
			makeNote( { id: 3, postId: 100, timestamp: minutesAgo( 1 ) } ),
		] );

		expect( conversations.map( ( { postId } ) => postId ) ).toEqual( [ 100, 200 ] );
	} );

	it( 'takes the excerpt, timestamp and comment id from the latest note', () => {
		const latest = minutesAgo( 1 );
		const [ conversation ] = groupNotesByPost( [
			makeNote( { id: 1, commentId: 11, excerpt: 'Older', timestamp: minutesAgo( 10 ) } ),
			makeNote( { id: 2, commentId: 22, excerpt: 'Newer', timestamp: latest } ),
		] );

		expect( conversation.excerpt ).toBe( 'Newer' );
		expect( conversation.latestCommentId ).toBe( 22 );
		expect( conversation.timestamp ).toBe( Date.parse( latest ) );
	} );

	it( 'reads the post title from the subject post range', () => {
		const [ conversation ] = groupNotesByPost( [ makeNote( { id: 1, title: 'Hello world' } ) ] );

		expect( conversation.title ).toBe( 'Hello world' );
	} );

	it( 'falls back to a post range in the body when the subject has none', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( {
				id: 1,
				subject: [ { text: 'Ana replied to your comment' }, { text: 'Excerpt' } ],
				body: [
					{
						text: 'On Fallback title',
						ranges: [ { type: 'post', indices: [ 3, 17 ], id: 1, parent: null } ],
					},
				],
			} ),
		] );

		expect( conversation.title ).toBe( 'Fallback title' );
	} );

	it( 'leaves the title empty when no post range exists', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( { id: 1, subject: [ { text: 'Ana replied' } ], body: [] } ),
		] );

		expect( conversation.title ).toBe( '' );
	} );

	it( 'tracks unread notes separately', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( { id: 1, read: 1 } ),
			makeNote( { id: 2, read: 0 } ),
			makeNote( { id: 3, read: 0 } ),
		] );

		expect( conversation.noteIds.sort() ).toEqual( [ 1, 2, 3 ] );
		expect( conversation.unreadNoteIds.sort() ).toEqual( [ 2, 3 ] );
	} );

	it( 'lists each commenter once, most recent first', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( { id: 1, commenter: 'Ana', timestamp: minutesAgo( 3 ) } ),
			makeNote( { id: 2, commenter: 'Bruno', timestamp: minutesAgo( 2 ) } ),
			makeNote( { id: 3, commenter: 'Ana', timestamp: minutesAgo( 1 ) } ),
		] );

		expect( conversation.commenters ).toEqual( [
			{ name: 'Ana', avatar: 'https://example.com/Ana.png' },
			{ name: 'Bruno', avatar: 'https://example.com/Bruno.png' },
		] );
	} );

	it( 'falls back to the note icon when the user block has no avatar', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( {
				id: 1,
				icon: 'https://example.com/icon.png',
				body: [ { type: 'user', text: 'Ana' } ],
			} ),
		] );

		expect( conversation.commenters ).toEqual( [
			{ name: 'Ana', avatar: 'https://example.com/icon.png' },
		] );
	} );

	it( 'reads the commenter from a subject user range when the body has none', () => {
		const text = 'Ana replied to your comment';
		const [ conversation ] = groupNotesByPost( [
			makeNote( {
				id: 1,
				icon: 'https://example.com/icon.png',
				subject: [
					{ text, ranges: [ { type: 'user', indices: [ 0, 3 ], id: 5, parent: null } ] },
					{ text: 'Excerpt' },
				],
				body: [ { type: 'comment', text: 'A reply' } ],
			} ),
		] );

		expect( conversation.commenters ).toEqual( [
			{ name: 'Ana', avatar: 'https://example.com/icon.png' },
		] );
	} );

	it( 'does not treat a comment block as the commenter', () => {
		const [ conversation ] = groupNotesByPost( [
			makeNote( { id: 1, body: [ { type: 'comment', text: 'A reply' } ] } ),
		] );

		expect( conversation.commenters ).toEqual( [] );
	} );

	const ME = 7;

	it.each( [
		[ 'post', { headerUserId: ME } ],
		[ 'reply', { headerUserId: ME, parentCommentId: 5 } ],
		[ 'mention', { headerUserId: 99, noticon: '\uf814' } ],
		[ 'other', { headerUserId: 99, parentCommentId: 5 } ],
		[ 'other', { headerUserId: ME, noticon: '\uf475' } ],
	] )( 'derives a %s context from %o', ( expected, overrides ) => {
		expect( groupNotesByPost( [ makeNote( { id: 1, ...overrides } ) ], ME )[ 0 ].context ).toBe(
			expected
		);
	} );

	it( 'skips notes without site or post ids', () => {
		expect( groupNotesByPost( [ makeNote( { id: 1, meta: { ids: { site: 10 } } } ) ] ) ).toEqual(
			[]
		);
	} );
} );

describe( 'getConversationKey', () => {
	it( 'builds the same key from numbers and route strings', () => {
		expect( getConversationKey( 10, 100 ) ).toBe( getConversationKey( '10', '100' ) );
	} );
} );
