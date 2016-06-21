/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPost,
	getNormalizedPost,
	getSitePosts,
	getSitePost,
	getSitePostsForQuery,
	isRequestingSitePostsForQuery,
	getSitePostsFoundForQuery,
	getSitePostsLastPageForQuery,
	isSitePostsLastPageForQuery,
	getSitePostsForQueryIgnoringPage,
	getSitePostsHierarchyForQueryIgnoringPage,
	isRequestingSitePost,
	getEditedPost,
	getEditedPostValue
} from '../selectors';
import PostQueryManager from 'lib/query-manager/post';

describe( 'selectors', () => {
	beforeEach( () => {
		getSitePosts.memoizedSelector.cache.clear();
		getSitePost.memoizedSelector.cache.clear();
		getSitePostsHierarchyForQueryIgnoringPage.memoizedSelector.cache.clear();
		getNormalizedPost.memoizedSelector.cache.clear();
	} );

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

	describe( '#getSitePosts()', () => {
		it( 'should return an array of post objects for the site', () => {
			const state = {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' },
						'0fcb4eb16f493c19b627438fdc18d57c': { ID: 120, site_ID: 77203074, global_ID: 'f0cb4eb16f493c19b627438fdc18d57c', title: 'Steak &amp; Eggs' }
					}
				}
			};

			expect( getSitePosts( state, 2916284 ) ).to.have.members( [
				state.posts.items[ '3d097cb7c5473c169bba0eb8e3c6cb64' ],
				state.posts.items[ '6c831c187ffef321eb43a67761a525a3' ]
			] );
		} );
	} );

	describe( '#getSitePost()', () => {
		describe( '#getSitePost()', () => {
			it( 'should return null if the post is not known for the site', () => {
				const post = getSitePost( {
					posts: {
						items: {}
					}
				}, 2916284, 413 );

				expect( post ).to.be.null;
			} );

			it( 'should return the object for the post site ID, post ID pair', () => {
				const post = getSitePost( {
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
							'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' },
							'0fcb4eb16f493c19b627438fdc18d57c': { ID: 120, site_ID: 77203074, global_ID: 'f0cb4eb16f493c19b627438fdc18d57c', title: 'Steak &amp; Eggs' }
						}
					}
				}, 2916284, 413 );

				expect( post ).to.eql( { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' } );
			} );
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

		it( 'should return an array of the known queried posts', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			] );
		} );
	} );

	describe( '#isRequestingSitePostsForQuery()', () => {
		it( 'should return false if the site has not been queried', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site has not been queried for the specific query', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {
						'2916284:{"search":"hel"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {
						'2916284:{"search":"hello"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {
						'2916284:{"search":"hello"}': false
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'getSitePostsFoundForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const found = getSitePostsFoundForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.be.null;
		} );

		it( 'should return the found items for a site query', () => {
			const found = getSitePostsFoundForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.equal( 1 );
		} );

		it( 'should return zero if in-fact there are zero items', () => {
			const found = getSitePostsFoundForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [],
									found: 0
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.equal( 0 );
		} );
	} );

	describe( '#getSitePostsLastPageForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a site query', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.equal( 1 );
		} );

		it( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getSitePostsLastPageForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 3, number: 1 } );

			expect( lastPage ).to.equal( 4 );
		} );
	} );

	describe( '#isSitePostsLastPageForQuery()', () => {
		it( 'should return null if the last page is not known', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isLastPage ).to.be.null;
		} );

		it( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 3, number: 1 } );

			expect( isLastPage ).to.be.false;
		} );

		it( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 4, number: 1 } );

			expect( isLastPage ).to.be.true;
		} );

		it( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isSitePostsLastPageForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', number: 1 } );

			expect( isLastPage ).to.be.true;
		} );
	} );

	describe( '#getSitePostsForQueryIgnoringPage()', () => {
		it( 'should return null if the query is not tracked', () => {
			const sitePosts = getSitePostsForQueryIgnoringPage( {
				posts: {
					items: {},
					queries: {}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return null if the query manager has not received items for query', () => {
			const sitePosts = getSitePostsForQueryIgnoringPage( {
				posts: {
					items: {},
					queries: {
						2916284: new PostQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return a concatenated array of all site posts ignoring page', () => {
			const sitePosts = getSitePostsForQueryIgnoringPage( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' }
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
								413: { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' }
							},
							queries: {
								'[]': {
									itemKeys: [ 841, 413 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			] );
		} );
	} );

	describe( '#getSitePostsHierarchyForQueryIgnoringPage()', () => {
		it( 'should return a concatenated array of all site posts ignoring page, preserving hierarchy', () => {
			const sitePosts = getSitePostsHierarchyForQueryIgnoringPage( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' },
						f0cb4eb16f493c19b627438fdc18d57c: { ID: 120, site_ID: 2916284, global_ID: 'f0cb4eb16f493c19b627438fdc18d57c', title: 'Steak &amp; Eggs', parent: { ID: 413 } }
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
								413: { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' },
								120: { ID: 120, site_ID: 2916284, global_ID: 'f0cb4eb16f493c19b627438fdc18d57c', title: 'Steak &amp; Eggs', parent: { ID: 413 } }
							},
							queries: {
								'[]': {
									itemKeys: [ 841, 413, 120 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', parent: 0 },
				{
					ID: 413,
					site_ID: 2916284,
					global_ID: '6c831c187ffef321eb43a67761a525a3',
					title: 'Ribs & Chicken',
					parent: 0,
					items: [
						{ ID: 120, site_ID: 2916284, global_ID: 'f0cb4eb16f493c19b627438fdc18d57c', title: 'Steak & Eggs', parent: 413 }
					]
				}
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

	describe( '#getEditedPost()', () => {
		it( 'should return the original post if no revisions exist on site', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					edits: {}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );

		it( 'should return revisions for a new draft', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {},
					edits: {
						2916284: {
							'': {
								title: 'Ribs &amp; Chicken'
							}
						}
					}
				}
			}, 2916284 );

			expect( editedPost ).to.eql( { title: 'Ribs &amp; Chicken' } );
		} );

		it( 'should return revisions for a draft if the original is unknown', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { title: 'Hello World!' } );
		} );

		it( 'should return revisions merged with the original post', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World!' } );
		} );

		it( 'should return revisions merged with original post nested properties', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', discussion: { comments_open: true } }
					},
					edits: {
						2916284: {
							841: {
								discussion: {
									pings_open: true
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', discussion: { comments_open: true, pings_open: true } } );
		} );
	} );

	describe( 'getEditedPostValue()', () => {
		it( 'should return undefined if the post does not exist', () => {
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {},
					edits: {}
				}
			}, 2916284, 841, 'title' );

			expect( editedPostValue ).to.be.undefined;
		} );

		it( 'should return the assigned post value', () => {
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841, 'title' );

			expect( editedPostValue ).to.equal( 'Hello World!' );
		} );

		it( 'should return the assigned nested post value', () => {
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', discussion: { comments_open: true } }
					},
					edits: {
						2916284: {
							841: {
								discussion: {
									pings_open: true
								}
							}
						}
					}
				}
			}, 2916284, 841, 'discussion.pings_open' );

			expect( editedPostValue ).to.be.true;
		} );
	} );
} );
