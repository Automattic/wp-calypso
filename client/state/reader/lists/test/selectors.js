/**
 * Internal dependencies
 */
import {
	isRequestingList,
	isRequestingSubscribedLists,
	getSubscribedLists,
	isUpdatedList,
	getListByOwnerAndSlug,
	getMatchingItem,
	isSubscribedByOwnerAndSlug,
	hasError,
	isMissingByOwnerAndSlug,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingList()', () => {
		test( 'should return false if not fetching', () => {
			const isRequesting = isRequestingList( {
				reader: {
					lists: {
						isRequestingList: false,
					},
				},
			} );

			expect( isRequesting ).toBeFalsy();
		} );

		test( 'should return true if fetching', () => {
			const isRequesting = isRequestingList( {
				reader: {
					lists: {
						isRequestingList: true,
					},
				},
			} );

			expect( isRequesting ).toBeTruthy();
		} );
	} );

	describe( '#isRequestingSubscribedLists()', () => {
		test( 'should return false if not fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequestingLists: false,
					},
				},
			} );

			expect( isRequesting ).toBeFalsy();
		} );

		test( 'should return true if fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequestingLists: true,
					},
				},
			} );

			expect( isRequesting ).toBeTruthy();
		} );
	} );

	describe( '#getSubscribedLists()', () => {
		test( 'should return an empty array if the user is not subscribed to any lists', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas',
							},
						},
						subscribedLists: [],
					},
				},
			} );

			expect( subscribedLists ).toEqual( [] );
		} );

		test( 'should retrieve items in a-z slug order', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas',
							},
							456: {
								ID: 456,
								slug: 'ants',
							},
						},
						subscribedLists: [ 123, 456 ],
					},
				},
			} );

			expect( subscribedLists ).toEqual( [
				{ ID: 456, slug: 'ants' },
				{ ID: 123, slug: 'bananas' },
			] );
		} );
	} );

	describe( '#isUpdatedList()', () => {
		test( 'should return false if list has not been updated', () => {
			const isUpdated = isUpdatedList(
				{
					reader: {
						lists: {
							updatedLists: [],
						},
					},
				},
				123
			);

			expect( isUpdated ).toBeFalsy();
		} );

		test( 'should return true if the list has been updated', () => {
			const isUpdated = isUpdatedList(
				{
					reader: {
						lists: {
							updatedLists: [ 123, 456 ],
						},
					},
				},
				123
			);

			expect( isUpdated ).toBeTruthy();
		} );
	} );

	describe( '#getListByOwnerAndSlug()', () => {
		test( 'should return undefined if the list does not exist', () => {
			const list = getListByOwnerAndSlug(
				{
					reader: {
						lists: {},
					},
				},
				'lister',
				'bananas'
			);

			expect( list ).toEqual( undefined );
		} );

		test( 'should return a list if the owner and slug match', () => {
			const list = getListByOwnerAndSlug(
				{
					reader: {
						lists: {
							items: {
								123: {
									ID: 123,
									owner: 'lister',
									slug: 'bananas',
								},
								456: {
									ID: 456,
									owner: 'lister',
									slug: 'ants',
								},
							},
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( list ).toEqual( {
				ID: 123,
				owner: 'lister',
				slug: 'bananas',
			} );
		} );
	} );

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

	describe( '#isSubscribedByOwnerAndSlug()', () => {
		test( 'should return false if the list does not exist', () => {
			const isSubscribed = isSubscribedByOwnerAndSlug(
				{
					reader: {
						lists: {},
						subscribedLists: [],
					},
				},
				'lister',
				'bananas'
			);

			expect( isSubscribed ).toEqual( false );
		} );

		test( 'should return true if the owner and slug match a subscribed list', () => {
			const isSubscribed = isSubscribedByOwnerAndSlug(
				{
					reader: {
						lists: {
							items: {
								123: {
									ID: 123,
									owner: 'lister',
									slug: 'bananas',
								},
								456: {
									ID: 456,
									owner: 'lister',
									slug: 'ants',
								},
							},
							subscribedLists: [ 123 ],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isSubscribed ).toEqual( true );
		} );
	} );

	describe( '#hasError()', () => {
		test( 'should return false if there is no error for the list', () => {
			const result = hasError(
				{
					reader: {
						lists: {
							errors: { 123: 400 },
						},
					},
				},
				456
			);

			expect( result ).toBeFalsy();
		} );

		test( 'should return true if the list has an error', () => {
			const result = hasError(
				{
					reader: {
						lists: {
							errors: { 123: 400 },
						},
					},
				},
				123
			);

			expect( result ).toBeTruthy();
		} );
	} );

	describe( '#isMissingByOwnerAndSlug()', () => {
		test( 'should return false if the missing list does not exist', () => {
			const isMissing = isMissingByOwnerAndSlug(
				{
					reader: {
						lists: {
							missingLists: [],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isMissing ).toEqual( false );
		} );

		test( 'should return true if the owner and slug match a missing list', () => {
			const isMissing = isMissingByOwnerAndSlug(
				{
					reader: {
						lists: {
							missingLists: [ { owner: 'lister', slug: 'bananas' } ],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isMissing ).toEqual( true );
		} );
	} );
} );
