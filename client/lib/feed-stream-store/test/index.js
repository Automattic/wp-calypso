/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect,
	useFilesystemMocks = require( 'test/helpers/use-filesystem-mocks' ),
	sinon = require( 'sinon' ),
	set = require( 'lodash/set' );

var PostListStore, FeedPostStore, FeedSubscriptionStore;

describe( 'FeedPostList', function() {
	useFilesystemMocks( __dirname );

	before( function() {
		PostListStore = require( '../feed-stream' );
		FeedPostStore = require( 'lib/feed-post-store' );
		FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' );
	} );

	it( 'should require an id, a fetcher, a keyMaker', function() {
		expect( function() {
			return new PostListStore();
		} ).to.throw( Error, /supply a feed stream spec/ );

		expect( function() {
			return new PostListStore( null );
		} ).to.throw( Error, /supply a feed stream spec/ );

		expect( function() {
			return new PostListStore( false );
		} ).to.throw( Error, /supply a feed stream spec/ );

		expect( function() {
			return new PostListStore( { id: 5 } );
		} ).to.throw( Error, /missing fetcher/ );

		expect( function() {
			return new PostListStore( {
				id: 5,
				fetcher: function() {}
			} );
		} ).to.throw( Error, /keyMaker/ );

		expect( function() {
			return new PostListStore( 5, function() {} );
		} ).to.be.ok;
	} );

	describe( 'A valid instance', function() {
		var fetcherStub, store;

		beforeEach( function() {
			fetcherStub = sinon.stub();
			store = new PostListStore( {
				id: 'test',
				fetcher: fetcherStub,
				keyMaker: function( post ) {
					return post;
				}
			} );
		} );

		it( 'should receive a page', function() {
			store.receivePage( 'test', null, { posts: [ { feed_ID: 1, ID: 1 }, { feed_ID: 1, ID: 2 } ] } );

			expect( store.get() ).to.have.lengthOf( 2 );
		} );

		describe( 'updates', function() {
			beforeEach( function() {
				let feedPostStoreStub = sinon.stub( FeedPostStore, 'get' );
				feedPostStoreStub.returns( { date: '1999-12-31T23:58:00' } );
				store.receiveUpdates( 'test', null, {
					date_range: {
						before: '1999-12-31T23:59:59',
						after: '1999-12-31T23:58:00'
					},
					posts: [ { feed_ID: 1, ID: 1 }, { feed_ID: 2, ID: 2 } ]
				} );
			} );

			afterEach( function() {
				FeedPostStore.get.restore();
			} );

			it( 'should receive updates', function() {
				expect( store.getUpdateCount() ).to.equal( 2 );
			} );

			it( 'should treat each set of updates as definitive', function() {
				var secondSet = {
					date_range: {
						before: '1999-12-31T23:59:59',
						after: '1999-12-31T23:58:00'
					},
					posts: [
						{
							feed_ID: 1,
							ID: 6,
							date: '1976-09-15T00:00:06+00:00'
						},
						{
							feed_ID: 1,
							ID: 5,
							date: '1976-09-15T00:00:05+00:00'
						},
						{
							feed_ID: 1,
							ID: 4,
							date: '1976-09-15T00:00:04+00:00'
						},
						{
							feed_ID: 1,
							ID: 3,
							date: '1976-09-15T00:00:03+00:00'
						}
					]
				};

				// new updates, overlapping
				store.receiveUpdates( 'test', null, secondSet );
				expect( store.getUpdateCount() ).to.equal( 4 );
			} );
		} );
	} );

	describe( 'Selected index', function() {
		var fetcherStub, store, feedPostStoreStub;
		beforeEach( function() {
			fetcherStub = sinon.stub();
			feedPostStoreStub = sinon.stub( FeedPostStore, 'get' );
			store = new PostListStore( {
				id: 'test',
				fetcher: fetcherStub,
				keyMaker: function( post ) {
					return post;
				}
			} );
			store.receivePage( 'test', null, { posts: [
				{ feed_ID: 1, ID: 1 },
				{ feed_ID: 1, ID: 2 },
				{ feed_ID: 1, ID: 3 },
				{ feed_ID: 1, ID: 4 } ]
			} );
		} );
		afterEach( function() {
			FeedPostStore.get.restore();
		} );

		it( 'should initially have nothing selected', function() {
			expect( store.getSelectedIndex() ).to.equal( -1 );
			expect( store.getSelectedPost() ).to.equal( null );
		} );

		it( 'should select the next item', function() {
			feedPostStoreStub.returns( {} );
			store.selectNextItem( -1 );
			expect( store.getSelectedIndex() ).to.equal( 0 );
		} );

		it( 'should select the next valid post', function() {
			feedPostStoreStub
				.onCall( 0 ).returns( { _state: 'error'} )
				.onCall( 1 ).returns( { _state: 'minimal' } )
				.onCall( 2 ).returns( {} )
				.onCall( 3 ).returns( {} );
			store.selectNextItem( -1 );
			expect( store.getSelectedIndex() ).to.equal( 2 );
		} );

		it( 'should be able to select a gap', function() {
			feedPostStoreStub
				.onCall( 0 ).returns( { _state: 'error'} )
				.onCall( 1 ).returns( { isGap: true } )
				.onCall( 2 ).returns( {} )
				.onCall( 3 ).returns( {} );
			store.selectNextItem( -1 );
			expect( store.getSelectedIndex() ).to.equal( 1 );
		} );

		it( 'should select the prev item', function() {
			feedPostStoreStub.returns( {} );
			store.selectPrevItem( 3 );
			expect( store.getSelectedIndex() ).to.equal( 2 );
		} );

		it( 'should select the prev valid post', function() {
			feedPostStoreStub
				.onCall( 0 ).returns( { _state: 'error' } )
				.onCall( 1 ).returns( {} );
			store.selectPrevItem( 3 );
			expect( store.getSelectedIndex() ).to.equal( 1 );
		} );
	} );

	describe( 'Filter followed x-posts', function() {
		var fetcherStub,
			store,
			isFollowingStub,
			posts,
			filteredPosts,
			xPostedTo;
		beforeEach( function() {
			fetcherStub = sinon.stub();
			sinon.stub( FeedPostStore, 'get' );
			isFollowingStub = sinon.stub( FeedSubscriptionStore, 'getIsFollowingBySiteUrl' );
			store = new PostListStore( {
				id: 'test',
				fetcher: fetcherStub,
				keyMaker: function( post ) {
					return post;
				}
			} );
			posts = [
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: {
						0: {
							key: '_xpost_original_permalink',
							value: 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts'
						}
					},
					site_name: 'Office Today',
					site_URL: 'http://officetoday.wordpress.com'
				} ),
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: {
						0: {
							key: '_xpost_original_permalink',
							value: 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts'
						}
					},
					site_name: 'WordPress.com News',
					site_URL: 'http://en.blog.wordpress.com'
				} ),
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: {
						0: {
							key: '_xpost_original_permalink',
							value: 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts#comment-1234'
						}
					},
					site_name: 'Foo Bar',
					site_URL: 'http://foo.bar.com'
				} ),
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: {
						0: {
							key: '_xpost_original_permalink',
							value: 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts#comment-1234'
						}
					},
					site_name: 'Developer Resources',
					site_URL: 'https://developer.wordpress.com/blog'
				} ),
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: {
						0: {
							key: '_xpost_original_permalink',
							value: 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts#comment-456'
						}
					},
					site_name: 'The Daily Post',
					site_URL: 'http://dailypost.wordpress.com'
				} ),
				set( {}, 'meta.data.post', {
					tags: { 'p2-xpost': {} },
					metadata: false,
					site_name: 'Example',
					site_URL: 'http://example.wordpress.com'
				} )
			];
		} );
		afterEach( function() {
			FeedPostStore.get.restore();
			FeedSubscriptionStore.getIsFollowingBySiteUrl.restore();
		} );

		it( 'rolls up x-posts and matching x-comments', function() {
			isFollowingStub.returns( false );
			filteredPosts = store.filterFollowedXPosts( posts );
			// in other words any +mentions get rolled up from the original post
			// the two +mentions from comment https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts#comment-1234
			// and finally https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts#comment-456
			expect( filteredPosts.length ).to.equal( 3 );
		} );

		it( 'when following origin site, filters followed x-posts, but leaves comment notices', function() {
			isFollowingStub.returns( true );
			filteredPosts = store.filterFollowedXPosts( posts );
			expect( filteredPosts.length ).to.equal( 2 );
			expect( filteredPosts[ 0 ].meta.data.post.site_URL ).to.equal( 'http://foo.bar.com' );
			expect( filteredPosts[ 1 ].meta.data.post.site_URL ).to.equal( 'http://dailypost.wordpress.com' );
		} );

		it( 'updates sites x-posted to', function() {
			isFollowingStub.returns( false );
			filteredPosts = store.filterFollowedXPosts( posts );
			xPostedTo = store.getSitesCrossPostedTo( 'https://restapiusertests.wordpress.com/2015/10/23/repeat-xposts' );
			expect( xPostedTo.length ).to.equal( 5 );
			expect( xPostedTo[ 0 ].siteName ).to.equal( '+officetoday' );
			expect( xPostedTo[ 0 ].siteURL ).to.equal( 'http://officetoday.wordpress.com' );
		} );

		it( 'filters xposts with no metadata', function() {
			posts = [ set( {}, 'meta.data.post', {
				tags: { 'p2-xpost': {} },
				metadata: false,
				site_name: 'Example',
				site_URL: 'http://example.wordpress.com'
			} ) ];
			filteredPosts = store.filterFollowedXPosts( posts );
			expect( filteredPosts.length ).to.equal( 0 );
		} );

		it( 'filters xposts with missing xpost metadata', function() {
			posts = [ set( {}, 'meta.data.post', {
				tags: { 'p2-xpost': {} },
				metadata: {
					0: {
						key: 'unrelated',
						value: 'unrelated'
					}
				},
				site_name: 'Example',
				site_URL: 'http://example.wordpress.com'
			} ) ];
			filteredPosts = store.filterFollowedXPosts( posts );
			expect( filteredPosts.length ).to.equal( 0 );
		} );
	} );
} );
