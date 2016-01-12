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
	isRequestingSitePostsForQuery
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPost()', () => {
		it( 'should return the object for the post global ID', () => {
			const post = getPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );

	describe( '#getSitePost()', () => {
		it( 'should return null if the site has not received any posts', () => {
			const post = getSitePost( {
				posts: {
					sitePosts: {}
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return null if the post is not known for the site', () => {
			const post = getSitePost( {
				posts: {
					sitePosts: {
						2916284: {}
					}
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return the object for the post site ID, post ID pair', () => {
			const post = getSitePost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					sitePosts: {
						2916284: {
							841: '3d097cb7c5473c169bba0eb8e3c6cb64'
						}
					}
				}
			}, 2916284, 841 );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );

	describe( '#isTrackingSitePostsQuery()', () => {
		it( 'should return false if the site has not been queried', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					siteQueries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isTracking ).to.be.false;
		} );

		it( 'should return false if the site has not been queried for the specific query', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					siteQueries: {
						2916284: {
							'{"search":"Hel"}': {
								fetching: true
							}
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isTracking ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isTracking = isTrackingSitePostsQuery( {
				posts: {
					siteQueries: {
						2916284: {
							'{"search":"Hello"}': {
								fetching: true
							}
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
					siteQueries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return null if the queried posts have not been received', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					siteQueries: {
						2916284: {
							'{"search":"Hello"}': {
								fetching: true
							}
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
					siteQueries: {
						2916284: {
							'{"search":"Hello"}': {
								fetching: false,
								posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
							}
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
					siteQueries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site query is not fetching', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					siteQueries: {
						2916284: {
							'{"search":"Hello"}': {
								fetching: false
							}
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site query is fetching', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					siteQueries: {
						2916284: {
							'{"search":"Hello"}': {
								fetching: true
							}
						}
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.true;
		} );
	} );
} );
