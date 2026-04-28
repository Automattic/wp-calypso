import { getMatchingItem } from '../selectors';

describe( 'selectors', () => {
	describe( '#getMatchingItem()', () => {
		const feed = {
			feed_ID: 1,
		};
		const feedItem = {
			feed_URL: 'https://www.example.com/rss',
			feed_ID: 1,
		};
		const site = {
			meta: { data: { site: { blog_ID: 0 } } },
			site_ID: 1,
		};
		const tag = {
			meta: { data: { tag: { blog_ID: 0 } } },
			tag_ID: 1,
		};
		// state.reader.feeds.items
		const state = {
			reader: {
				feeds: { items: { 1: feedItem } },
				lists: { listItems: { 1: [ feed, site, tag ] } },
			},
		};
		test( 'should return false if the list does not exist', () => {
			expect( getMatchingItem( state, { feedUrl: 'www.example.com', listId: 2 } ) ).toEqual(
				false
			);
		} );

		test( 'should return the matching feed by its ID if it exists in the specified list', () => {
			expect( getMatchingItem( state, { feedId: 1, listId: 1 } ) ).toEqual( feed );
			expect( getMatchingItem( state, { feedId: '1', listId: 1 } ) ).toEqual( feed );
			expect( getMatchingItem( state, { feedId: 1, listId: '1' } ) ).toEqual( feed );
			expect( getMatchingItem( state, { feedId: 2, listId: 1 } ) ).toEqual( false );
		} );

		test( 'should return the matching feed by its URL if it exists in the specified list', () => {
			expect(
				getMatchingItem( state, { feedUrl: 'https://www.example.com/rss', listId: 1 } )
			).toEqual( feed );
			expect(
				getMatchingItem( state, { feedUrl: 'http://www.example.com/rss', listId: 1 } )
			).toEqual( feed );
			expect( getMatchingItem( state, { feedUrl: 'www.example.com/rss', listId: 1 } ) ).toEqual(
				feed
			);
		} );

		test( 'should return the matching site by its ID if it exists in the specified list', () => {
			expect( getMatchingItem( state, { siteId: 1, listId: 1 } ) ).toEqual( site );
			expect( getMatchingItem( state, { siteId: '1', listId: 1 } ) ).toEqual( site );
			expect( getMatchingItem( state, { siteId: 1, listId: '1' } ) ).toEqual( site );
			expect( getMatchingItem( state, { siteId: 2, listId: 1 } ) ).toEqual( false );
		} );

		test( 'should return the matching tag by its ID if it exists in the specified list', () => {
			expect( getMatchingItem( state, { tagId: 1, listId: 1 } ) ).toEqual( tag );
			expect( getMatchingItem( state, { tagId: '1', listId: 1 } ) ).toEqual( tag );
			expect( getMatchingItem( state, { tagId: 1, listId: '1' } ) ).toEqual( tag );
			expect( getMatchingItem( state, { tagId: 2, listId: 1 } ) ).toEqual( false );
		} );
	} );
} );
