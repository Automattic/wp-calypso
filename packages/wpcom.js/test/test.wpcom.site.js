/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

describe( 'wpcom.site', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	let testing_post;
	let new_post_ID;
	let site_ID;

	// Create a testing_post before to start tests
	before( ( done ) => {
		site
			.addPost( fixture.post )
			.then( ( data_post ) => {
				testing_post = data_post;

				return site.get();
			} )
			.then( ( data_site ) => {
				site_ID = data_site.ID;

				done();
			} )
			.catch( done );
	} );

	// Delete testing post
	after( ( done ) => {
		site
			.deletePost( testing_post.ID )
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.lists', function () {
		describe( 'wpcom.site.categoriesList', function () {
			it( 'should request categories list', () => {
				return new Promise( ( done ) => {
					site
						.categoriesList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.categories );
							assert.ok( list.categories instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.commentsList', function () {
			it( 'should request comments list', () => {
				return new Promise( ( done ) => {
					site
						.commentsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.comments );
							assert.ok( list.comments instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.domainsList', function () {
			it( 'should request domains list', () => {
				return new Promise( ( done ) => {
					site
						.domainsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'object', typeof list.domains );
							assert.ok( list.domains instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.embedsList', function () {
			it( 'should request embeds list', () => {
				return new Promise( ( done ) => {
					site
						.embedsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'object', typeof list.embeds );
							assert.ok( list.embeds instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.followsList', function () {
			it( 'should request follows list', () => {
				return new Promise( ( done ) => {
					site
						.followsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.users );
							assert.ok( list.users instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.mediaList', function () {
			it( 'should request media library list', () => {
				return new Promise( ( done ) => {
					site
						.mediaList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.media );
							assert.ok( list.media instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.postCounts', function () {
			it( 'should get post counts with `post` type', function () {
				return new Promise( ( done ) => {
					site.postCounts( 'post', function ( err, data ) {
						if ( err ) throw err;

						assert.ok( data.counts instanceof Object );
						assert.ok( data.counts.all instanceof Object );
						assert.ok( data.counts.mine instanceof Object );
						done();
					} );
				} );
			} );

			it( 'should get post counts with `page` status', function () {
				return new Promise( ( done ) => {
					site.postCounts( 'page', function ( err, data ) {
						if ( err ) throw err;

						assert.ok( data.counts instanceof Object );
						assert.ok( data.counts.all instanceof Object );
						assert.ok( data.counts.mine instanceof Object );
						done();
					} );
				} );
			} );

			it( 'should return 404 by unknown type', function () {
				return new Promise( ( done ) => {
					const rnd = String( Math.random() ).substr( 2 );
					site.postCounts( rnd, function ( err ) {
						assert.ok( 'Unknown post type requested', err.message );
						done();
					} );
				} );
			} );
		} );

		describe( 'wpcom.site.postsList', function () {
			it( 'should request posts list', () => {
				return new Promise( ( done ) => {
					site
						.postsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );

							// `posts list` object data testing
							assert.equal( 'number', typeof list.found );

							assert.equal( 'object', typeof list.posts );
							assert.ok( list.posts instanceof Array );

							done();
						} )
						.catch( done );
				} );
			} );

			it( 'should request only one post', () => {
				return new Promise( ( done ) => {
					site
						.postsList( { number: 1 } )
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.posts );
							assert.ok( list.posts instanceof Array );
							assert.ok( list.posts.length <= 1 );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.postTypesList', function () {
			it( 'should get post types list of the site', function () {
				return new Promise( ( done ) => {
					site
						.postTypesList()
						.then( ( data ) => {
							assert.ok( data.found >= 1 );
							assert.ok( data.post_types instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.shortcodesList', function () {
			it( 'should request shortcodes list', () => {
				return new Promise( ( done ) => {
					site
						.shortcodesList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'object', typeof list.shortcodes );
							assert.ok( list.shortcodes instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.stats', function () {
			it( 'should request stats data', () => {
				return new Promise( ( done ) => {
					site
						.stats()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.equal( 'object', typeof data.stats );
							assert.ok( data.stats instanceof Object );

							assert.equal( 'object', typeof data.visits );
							assert.ok( data.visits instanceof Object );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsClicks', function () {
			it( 'should request clicks stats', () => {
				return new Promise( ( done ) => {
					site
						.statsClicks()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.date ) );
							assert.equal( 'object', typeof data.days );
							assert.equal( 'string', typeof data.period );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsCommentFollowers', function () {
			it( 'should request comment follower data', () => {
				return new Promise( ( done ) => {
					site
						.statsCommentFollowers()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.posts instanceof Array );
							assert.equal( 'number', typeof data.page );
							assert.equal( 'number', typeof data.pages );
							assert.equal( 'number', typeof data.total );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsComments', function () {
			it( 'should request comments data', () => {
				return new Promise( ( done ) => {
					site
						.statsComments()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.authors instanceof Array );
							assert.ok( data.posts instanceof Array );

							assert.equal( 'number', typeof data.monthly_comments );
							assert.equal( 'number', typeof data.total_comments );
							assert.ok( 'most_active_day' in data );
							assert.ok( 'most_active_time' in data );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsCountryViews', function () {
			it( 'should request country views stats', () => {
				return new Promise( ( done ) => {
					site
						.statsCountryViews()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.date ) );
							assert.equal( 'object', typeof data.days );
							assert.equal( 'object', typeof data[ 'country-info' ] );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsFollowers', function () {
			it( 'should request follower data', () => {
				return new Promise( ( done ) => {
					site
						.statsFollowers()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.subscribers instanceof Array );
							assert.equal( 'number', typeof data.page );
							assert.equal( 'number', typeof data.pages );
							assert.equal( 'number', typeof data.total );
							assert.equal( 'number', typeof data.total_email );
							assert.equal( 'number', typeof data.total_wpcom );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsInsights', function () {
			it( 'should request insight data', () => {
				return new Promise( ( done ) => {
					site
						.statsInsights()
						.then( ( data ) => {
							assert.equal( 'number', typeof data.highest_hour );
							assert.equal( 'number', typeof data.highest_hour_percent );
							assert.equal( 'number', typeof data.highest_day_of_week );
							assert.equal( 'number', typeof data.highest_day_percent );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsPublicize', function () {
			it( 'should request publicize data', () => {
				return new Promise( ( done ) => {
					site
						.statsPublicize()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.services instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsReferrers', function () {
			it( 'should request referrers stats', () => {
				return new Promise( ( done ) => {
					site
						.statsReferrers()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.date ) );
							assert.equal( 'object', typeof data.days );
							assert.equal( 'string', typeof data.period );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsSearchTerms', function () {
			it( 'should request search terms stats', () => {
				return new Promise( ( done ) => {
					site
						.statsSearchTerms()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.date ) );
							assert.equal( 'object', typeof data.days );
							assert.equal( 'string', typeof data.period );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsStreak', function () {
			it( 'should request streak data', () => {
				return new Promise( ( done ) => {
					site
						.statsStreak()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.streak instanceof Object );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsSummary', function () {
			it( 'should request summary data', () => {
				return new Promise( ( done ) => {
					site
						.statsSummary()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.equal( 'string', typeof data.period );
							assert.equal( 'number', typeof data.likes );
							assert.equal( 'number', typeof data.views );
							assert.equal( 'number', typeof data.visitors );
							assert.equal( 'number', typeof data.comments );
							assert.equal( 'number', typeof data.followers );
							assert.equal( 'number', typeof data.reblogs );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsTags', function () {
			it( 'should request tag data', () => {
				return new Promise( ( done ) => {
					site
						.statsTags()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.ok( data.tags instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsTopAuthors', function () {
			it( 'should request author data', () => {
				return new Promise( ( done ) => {
					site
						.statsTopAuthors()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.equal( 'string', typeof data.period );
							assert.ok( data.days instanceof Object );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsTopPosts', function () {
			it( 'should request top posts stats', () => {
				return new Promise( ( done ) => {
					site
						.statsTopPosts()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.date ) );
							assert.equal( 'object', typeof data.days );
							assert.equal( 'string', typeof data.period );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsVideoPlays', function () {
			it( 'should request video play data', () => {
				return new Promise( ( done ) => {
					site
						.statsVideoPlays()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.day ) );
							assert.equal( 'string', typeof data.period );
							assert.ok( data.days instanceof Object );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.statsVisits', function () {
			it( 'should request visits stats', () => {
				return new Promise( ( done ) => {
					site
						.statsVisits()
						.then( ( data ) => {
							assert.equal( 'string', typeof Date( data.unit ) );

							assert.equal( 'object', typeof data.data );
							assert.ok( data.data instanceof Array );

							assert.equal( 'object', typeof data.fields );
							assert.ok( data.fields instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.tagsList', function () {
			it( 'should request tags list', () => {
				return new Promise( ( done ) => {
					site
						.tagsList()
						.then( ( list ) => {
							// list object data testing
							assert.equal( 'object', typeof list );
							assert.equal( 'number', typeof list.found );
							assert.equal( 'object', typeof list.tags );
							assert.ok( list.tags instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );

		describe( 'wpcom.site.usersList', function () {
			it( 'should request users list', () => {
				return new Promise( ( done ) => {
					site
						.usersList()
						.then( ( list ) => {
							assert.equal( 'number', typeof list.found );
							assert.ok( list.users instanceof Array );
							done();
						} )
						.catch( done );
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.get', function () {
		it( 'should require site data', () => {
			return new Promise( ( done ) => {
				site
					.get()
					.then( ( data ) => {
						assert.equal( 'number', typeof data.ID );
						assert.equal( 'string', typeof data.name );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.addPost', function () {
		it( 'should create a new blog post', () => {
			return new Promise( ( done ) => {
				site
					.addPost( fixture.post )
					.then( ( data ) => {
						// store in post ID global var
						new_post_ID = data.ID;

						assert.equal( 'object', typeof data );
						assert.equal( site_ID, data.site_ID );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.deletePost', function () {
		it( 'should delete post added', () => {
			return new Promise( ( done ) => {
				site
					.deletePost( new_post_ID )
					.then( ( data ) => {
						assert.equal( 'object', typeof data );
						assert.equal( new_post_ID, data.ID );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.addMediaFiles', function () {
		it( 'should create a new media from a file', () => {
			return new Promise( ( done ) => {
				site
					.addMediaFiles( fixture.media.files )
					.then( ( data ) => {
						assert.ok( data );
						assert.ok( data.media instanceof Array );
						assert.equal( fixture.media.files.length, data.media.length );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.addMediaUrls', function () {
		it( 'should create a new site media', () => {
			return new Promise( ( done ) => {
				site
					.addMediaUrls( fixture.media.urls )
					.then( ( data ) => {
						assert.ok( data );
						assert.ok( data.media instanceof Array );
						assert.equal( fixture.media.urls.length, data.media.length );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.statsReferrersSpamNew', function () {
		const d = new Date();
		const domain = d.getTime() / 1000 + 'wordpress.com';
		it( 'should mark a domain as spam', () => {
			return new Promise( ( done ) => {
				site
					.statsReferrersSpamNew( domain )
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.statsReferrersSpamDelete', function () {
		const d = new Date();
		const domain = d.getTime() / 1000 + 'wordpress.com';
		it( 'should remove a domain from spam refferer list', () => {
			return new Promise( ( done ) => {
				site
					.statsReferrersSpamDelete( domain )
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.statsPostViews', function () {
		it( 'should request post stat details', () => {
			return new Promise( ( done ) => {
				site
					.statsPostViews( testing_post.ID )
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( 'string', typeof Date( data.date ) );
						assert.equal( 'number', typeof data.views );
						assert.equal( 'number', typeof data.highest_month );
						assert.equal( 'number', typeof data.highest_day_average );
						assert.equal( 'number', typeof data.highest_week_average );
						assert.ok( data.post instanceof Object );
						assert.ok( data.years instanceof Object );
						assert.ok( data.weeks instanceof Object );
						assert.ok( data.fields instanceof Array );
						assert.ok( data.data instanceof Array );
						assert.ok( data.averages instanceof Object );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.statsVideo', function () {
		it( 'should request video stats', () => {
			return new Promise( ( done ) => {
				site
					.statsVideo( testing_post.ID )
					.then( ( data ) => {
						assert.ok( data );
						assert( data.fields instanceof Array );
						assert( data.data instanceof Array );
						assert( data.pages instanceof Array );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.pageTemplates', function () {
		it( 'should request page templates', () => {
			return new Promise( ( done ) => {
				site
					.pageTemplates()
					.then( ( data ) => {
						assert.ok( data );
						assert( data.templates instanceof Array );
						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
