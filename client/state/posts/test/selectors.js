/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPost,
	getSitePost,
	isTrackingSitePostsQuery,
	getSitePostsForQuery,
	isRequestingSitePostsForQuery,
	getSitePostsLastPageForQuery,
	isSitePostsLastPageForQuery,
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePost,
	getPostsByGlobalId
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPost()', () => {
		it( 'should return the object for the post global ID', () => {
			const post = getPost( {
				posts: {
					items: [
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					]
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );

	describe( '#getSitePost()', () => {
		it( 'should return null if the site has not received any posts', () => {
			const post = getSitePost( {
				posts: {
					items: []
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return null if the post is not known for the site', () => {
			const post = getSitePost( {
				posts: {
					items: [
						{
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							site_ID: 2916284
						}
					]
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return the object for the post site ID, post ID pair', () => {
			const post = getSitePost( {
				posts: {
					items: [
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					]
				}
			}, 2916284, 841 );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );

	describe( '#isTrackingSitePostsQuery()', () => {
		it( 'should return false if the site has not been queried', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isTracking ).to.be.false;
		} );

		it( 'should return false if the site has not been queried for the specific query', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					queries: {
						'2916284:{"search":"hel"}': {
							fetching: true
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isTracking ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					queries: {
						'2916284:{"search":"hello"}': {
							fetching: true
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isTracking ).to.be.true;
		} );
	} );

	describe( '#getSitePostsForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return null if the queried posts have not been received', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {
						'2916284:{"search":"hello"}': {
							fetching: true
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return an array of the known queried posts', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					queries: {
						'2916284:{"search":"hello"}': {
							fetching: false,
							posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			] );
		} );
	} );

	describe( '#isRequestingSitePostsForQuery()', () => {
		it( 'should return false if the site query is not tracked', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site query is not fetching', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queries: {
						'2916284:{"search":"hello"}': {
							fetching: false
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site query is fetching', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queries: {
						'2916284:{"search":"hello"}': {
							fetching: true
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getSitePostsLastPageForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a site query', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {
						'2916284:{"search":"hello"}': 4
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.equal( 4 );
		} );

		it( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {
						'2916284:{"search":"hello"}': 4
					}
				}
			}, 2916284, { search: 'Hello', page: 3 } );

			expect( lastPage ).to.equal( 4 );
		} );
	} );

	describe( '#isSitePostsLastPageForQuery()', () => {
		it( 'should return null if the last page is not known', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isLastPage ).to.be.null;
		} );

		it( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {
						'2916284:{"search":"hello"}': 4
					}
				}
			}, 2916284, { search: 'Hello', page: 3 } );

			expect( isLastPage ).to.be.false;
		} );

		it( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {
						'2916284:{"search":"hello"}': 4
					}
				}
			}, 2916284, { search: 'Hello', page: 4 } );

			expect( isLastPage ).to.be.true;
		} );

		it( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {
						'2916284:{"search":"hello"}': 1
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isLastPage ).to.be.true;
		} );
	} );

	describe( '#getSitePostsForQueryIgnoringPage()', () => {
		it( 'should return null if the last page is not known', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queriesLastPage: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isLastPage ).to.be.null;
		} );

		it( 'should return a concatenated array of all site posts ignoring page', () => {
			const sitePosts = getSitePostsForQueryIgnoringPage( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
					},
					queries: {
						'2916284:{"number":1}': {
							fetching: false,
							posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
						},
						'2916284:{"number":1,"page":2}': {
							fetching: false,
							posts: [ '6c831c187ffef321eb43a67761a525a3' ]
						}
					},
					queriesLastPage: {
						'2916284:{"number":1}': 2
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			] );
		} );
	} );

	describe( '#isRequestingSitePost()', () => {
		it( 'should return false if no request has been made', () => {
			const isRequesting = isRequestingSitePost( {
				posts: {
					siteRequests: {}
				}
			}, 2916284, 841 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingSitePost( {
				posts: {
					siteRequests: {
						2916284: {
							841: true
						}
					}
				}
			}, 2916284, 841 );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if a request has finished', () => {
			const isRequesting = isRequestingSitePost( {
				posts: {
					siteRequests: {
						2916284: {
							841: false
						}
					}
				}
			}, 2916284, 841 );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( '#getPostsByGlobalId()', () => {
		it( 'should index by global id', () => {
			const postsByGlobalId = getPostsByGlobalId( {
				posts: {
					items: [
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Goodbye' }
					]
				}
			} );
			expect( postsByGlobalId[ '3d097cb7c5473c169bba0eb8e3c6cb64' ] ).to.eql(
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			);
			expect( postsByGlobalId['6c831c187ffef321eb43a67761a525a3'] ).to.eql(
				{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Goodbye' }
			);
		} );
	} );
} );
