/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getPost,
	getNormalizedPost,
	getSitePosts,
	getSitePost,
	getSitePostsForQuery,
	isPostPublished,
	isRequestingSitePostsForQuery,
	getSitePostsFoundForQuery,
	getSitePostsLastPageForQuery,
	isSitePostsLastPageForQuery,
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQueryIgnoringPage,
	getEditedPost,
	getPostEdits,
	getEditedPostValue,
	getEditedPostSlug,
	isEditedPostDirty,
	getPostPreviewUrl,
	getSitePostsByTerm
} from '../selectors';
import PostQueryManager from 'lib/query-manager/post';

describe( 'selectors', () => {
	beforeEach( () => {
		getSitePosts.memoizedSelector.cache.clear();
		getSitePost.memoizedSelector.cache.clear();
		getSitePostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingSitePostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		getNormalizedPost.memoizedSelector.cache.clear();
		getSitePostsForQuery.memoizedSelector.cache.clear();
		getSitePostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		isPostPublished.memoizedSelector.cache.clear();
	} );

	describe( '#getPost()', () => {
		it( 'should return null if the global ID is not tracked', () => {
			const post = getPost( {
				posts: {
					items: {},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.be.null;
		} );

		it( 'should return null if there is no manager associated with the path site', () => {
			const post = getPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.be.null;
		} );

		it( 'should return the object for the post global ID', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken'
			};
			const post = getPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.equal( postObject );
		} );
	} );

	describe( 'getNormalizedPost()', () => {
		it( 'should return null if the post is not tracked', () => {
			const normalizedPost = getNormalizedPost( {
				posts: {
					items: {},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( normalizedPost ).to.be.null;
		} );

		it( 'should return a normalized copy of the post', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				author: {
					name: 'Badman <img onerror= />'
				},
				post_thumbnail: {
					URL: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				}
			};

			const normalizedPost = getNormalizedPost( deepFreeze( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					}
				}
			} ), '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( normalizedPost ).to.not.equal( postObject );
			expect( normalizedPost ).to.eql( {
				...postObject,
				title: 'Ribs & Chicken',
				author: {
					name: 'Badman '
				},
				canonical_image: {
					uri: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				}
			} );
		} );
	} );

	describe( '#getSitePosts()', () => {
		it( 'should return an array of post objects for the site', () => {
			const postObjects = {
				2916284: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					},
					'6c831c187ffef321eb43a67761a525a3': {
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs &amp; Chicken'
					}
				},
				77203074: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: 77203074,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs'
					}
				}
			};
			const state = {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: postObjects[ 2916284 ]
						} ),
						77203074: new PostQueryManager( {
							items: postObjects[ 77203074 ]
						} )
					},

				}
			};

			expect( getSitePosts( state, 2916284 ) ).to.have.members( values( postObjects[ 2916284 ] ) );
		} );
	} );

	describe( '#getSitePost()', () => {
		it( 'should return null if the post is not known for the site', () => {
			const post = getSitePost( {
				posts: {
					queries: {}
				}
			}, 2916284, 413 );

			expect( post ).to.be.null;
		} );

		it( 'should return the object for the post site ID, post ID pair', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const post = getSitePost( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					}
				}
			}, 2916284, 841 );

			expect( post ).to.equal( postObject );
		} );
	} );

	describe( '#getSitePostsForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return null if the query is not tracked to the query manager', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( sitePosts ).to.be.null;
		} );

		it( 'should return an array of normalized known queried posts', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Ribs &amp; Chicken'
								}
							},
							queries: {
								'[["search","Ribs"]]': {
									itemKeys: [ 841 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( sitePosts ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			] );
		} );

		it( 'should return null if we know the number of found items but the requested set hasn\'t been received', () => {
			const sitePosts = getSitePostsForQuery( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								1204: {
									ID: 1204,
									site_ID: 2916284,
									global_ID: '48b6010b559efe6a77a429773e0cbf12',
									title: 'Sweet &amp; Savory'
								}
							},
							queries: {
								'[["search","Sweet"]]': {
									itemKeys: [ 1204, undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sweet', number: 1, page: 2 } );

			expect( sitePosts ).to.be.null;
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
						'2916284:{"search":"Hel"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {
						'2916284:{"search":"Hello"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingSitePostsForQuery( {
				posts: {
					queryRequests: {
						'2916284:{"search":"Hello"}': false
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

		it( 'should return 1 if there are no found posts', () => {
			const lastPage = getSitePostsLastPageForQuery( {
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

			expect( lastPage ).to.equal( 1 );
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
						'3d097cb7c5473c169bba0eb8e3c6cb64': {
							ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World'
						},
						'6c831c187ffef321eb43a67761a525a3': {
							ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken'
						}
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World'
								},
								413: {
									ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken'
								}
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

		it( 'should omit found items for which the requested result hasn\'t been received', () => {
			const sitePosts = getSitePostsForQueryIgnoringPage( {
				posts: {
					items: {
						'48b6010b559efe6a77a429773e0cbf12': {
							ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet &amp; Savory'
						}
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								1204: {
									ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet &amp; Savory'
								}
							},
							queries: {
								'[["search","Sweet"]]': {
									itemKeys: [ 1204, undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sweet', number: 1 } );

			expect( sitePosts ).to.eql( [
				{ ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet & Savory' }
			] );
		} );
	} );

	describe( 'isRequestingSitePostsForQueryIgnoringPage()', () => {
		it( 'should return false if not requesting for query', () => {
			const isRequesting = isRequestingSitePostsForQueryIgnoringPage( {
				posts: {
					queryRequests: {}
				}
			}, 2916284, { search: 'hel' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true requesting for query at exact page', () => {
			const isRequesting = isRequestingSitePostsForQueryIgnoringPage( {
				posts: {
					queryRequests: {
						'2916284:{"search":"hel","page":4}': true
					}
				}
			}, 2916284, { search: 'hel', page: 4 } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return true requesting for query without page specified', () => {
			const isRequesting = isRequestingSitePostsForQueryIgnoringPage( {
				posts: {
					queryRequests: {
						'2916284:{"search":"hel","page":4}': true
					}
				}
			}, 2916284, { search: 'hel' } );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getEditedPost()', () => {
		beforeEach( () => {
			getEditedPost.memoizedSelector.cache.clear();
		} );

		it( 'should return the original post if no revisions exist on site', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					},
					edits: {}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.equal( postObject );
		} );

		it( 'should return revisions for a new draft', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {},
					queries: {},
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
					queries: {},
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
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
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

			expect( editedPost ).to.eql( {
				...postObject,
				title: 'Hello World!'
			} );
		} );

		it( 'should return revisions merged with original post nested properties', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true
				}
			};
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
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

			expect( editedPost ).to.eql( {
				...postObject,
				discussion: {
					comments_open: true,
					pings_open: true
				}
			} );
		} );

		it( 'should return revisions with array properties overwriting objects', () => {
			// This tests the initial edit of a non-hierarchical taxonomy
			// TODO avoid changing the shape of the `terms` state - see:
			// https://github.com/Automattic/wp-calypso/pull/6548#issuecomment-233148766
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									terms: {
										post_tag: {
											tag1: { ID: 1 },
											tag2: { ID: 2 }
										},
										category: {
											category3: { ID: 3 },
											category4: { ID: 4 }
										}
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								terms: {
									post_tag: [ 'tag2', 'tag3' ]
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					post_tag: [ 'tag2', 'tag3' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 }
					}
				}
			} );
		} );

		it( 'should return revisions with array properties overwriting previous versions', () => {
			// This tests removal of a term from a non-hierarchical taxonomy
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									terms: {
										post_tag: [ 'tag1', 'tag2' ],
										category: {
											category3: { ID: 3 },
											category4: { ID: 4 }
										}
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								terms: {
									post_tag: [ 'tag1' ]
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					post_tag: [ 'tag1' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 }
					}
				}
			} );
		} );
	} );

	describe( 'getPostEdits()', () => {
		it( 'should return null if no edits exist for a new post', () => {
			const postEdits = getPostEdits( {
				posts: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284 );

			expect( postEdits ).to.be.null;
		} );

		it( 'should return null if no edits exist for an existing post', () => {
			const postEdits = getPostEdits( {
				posts: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284, 841 );

			expect( postEdits ).to.be.null;
		} );

		it( 'should return the edited attributes for a new post', () => {
			const postEdits = getPostEdits( {
				posts: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							'': {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284 );

			expect( postEdits ).to.eql( {
				title: 'Hello World!'
			} );
		} );

		it( 'should return the edited attributes for an existing post', () => {
			const postEdits = getPostEdits( {
				posts: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( postEdits ).to.eql( {
				title: 'Hello World!'
			} );
		} );
	} );

	describe( 'getEditedPostValue()', () => {
		it( 'should return undefined if the post does not exist', () => {
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284, 841, 'title' );

			expect( editedPostValue ).to.be.undefined;
		} );

		it( 'should return the assigned post value', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
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
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true
				}
			};
			const editedPostValue = getEditedPostValue( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
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

	describe( 'isEditedPostDirty()', () => {
		beforeEach( () => {
			isEditedPostDirty.memoizedSelector.cache.clear();
		} );

		it( 'should return false if there are no edits for the post', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64'
								}
							}
						} )
					},
					edits: {}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if edited with a type', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								type: 'post'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if newly edited with custom type', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {},
					edits: {
						2916284: {
							'': {
								type: 'jetpack-portfolio'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if no saved post and value matches default for new post', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {},
					edits: {
						2916284: {
							'': {
								status: 'draft'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return true if no saved post and value does not match default for new post', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {},
					edits: {
						2916284: {
							'': {
								status: 'publish'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.true;
		} );

		it( 'should return true if no saved post and no default exists for key', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {},
					edits: {
						2916284: {
							'': {
								author: 'testonesite2014'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.true;
		} );

		it( 'should return false if saved post value equals edited post value', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return true if saved post value does not equal edited post value', () => {
			const isDirty = isEditedPostDirty( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World'
								}
							}
						} )
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

			expect( isDirty ).to.be.true;
		} );
	} );

	describe( 'getPostPreviewUrl()', () => {
		it( 'should return null if the post is not known', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should return null if the post has no URL', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should return null if the post is trashed', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									URL: 'http://example.com/post-url',
									status: 'trash'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should prefer the post preview URL if available', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									URL: 'http://example.com/post-url',
									preview_URL: 'https://example.com/preview-url'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/preview-url' );
		} );

		it( 'should use post URL if preview URL not available', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									URL: 'https://example.com/post-url'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/post-url' );
		} );

		it( 'should append preview query argument to non-published posts', () => {
			const previewUrl = getPostPreviewUrl( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									URL: 'https://example.com/post-url?other_arg=1'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/post-url?other_arg=1&preview=true' );
		} );
	} );

	describe( 'isPostPublished()', () => {
		it( 'should return null if the post is not known', () => {
			const isPublished = isPostPublished( {
				posts: {
					queries: {}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.null;
		} );

		it( 'should return true if the post status is publish', () => {
			const isPublished = isPostPublished( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );

		it( 'should return true if the post status is private', () => {
			const isPublished = isPostPublished( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );

		it( 'should return false if the post status is draft', () => {
			const isPublished = isPostPublished( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.false;
		} );

		it( 'should return false if the post status is future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;
			const isPublished = isPostPublished( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'future',
									date: postDate
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.false;
		} );

		it( 'should return true if the post status is future and date is in past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;
			const isPublished = isPostPublished( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'future',
									date: postDate
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );
	} );

	describe( 'getEditedPostSlug()', () => {
		it( 'should return undefined if the post is not known', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {}
				}
			}, 2916284, 841 );

			expect( slug ).to.be.undefined;
		} );

		it( 'should return post.slug if post is published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									slug: 'chewbacca'
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'chewbacca' );
		} );

		it( 'should return decoded non-latin post.slug if post is published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									slug: '%D7%96%D7%94%D7%95%20%D7%A2%D7%99%D7%9F%20%D7%94%D7%A0%D7%9E%D7%A8'
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'זהו עין הנמר' );
		} );

		it( 'should return edited slug if post is not published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									slug: 'chewbacca',
									other_URLs: {
										suggested_slug: 'chewbacca'
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: 'jedi'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'jedi' );
		} );

		it( 'should return suggested-slug if post is not published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									other_URLs: {
										suggested_slug: 'chewbacca'
									}
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'chewbacca' );
		} );

		it( 'should return slug if post is not published and slug is set', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'jedi' );
		} );

		it( 'should return edited slug if post is published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: 'ewok'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'ewok' );
		} );

		it( 'should return an empty edited slug if post is published', () => {
			const slug = getEditedPostSlug( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: ''
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( '' );
		} );
	} );

	describe( 'getSitePostsByTerm()', () => {
		it( 'should return an array of post objects for the site matching the termId', () => {
			const postObjects = {
				2916284: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						terms: {
							category: [
								{ ID: 10 }
							]
						}
					},
					'6c831c187ffef321eb43a67761a525a3': {
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs &amp; Chicken'
					}
				}
			};
			const state = {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: postObjects[ 2916284 ]
						} )
					},
				}
			};

			expect( getSitePostsByTerm( state, 2916284, 'category', 10 ) )
				.to.have.members( [ postObjects[ 2916284 ][ '3d097cb7c5473c169bba0eb8e3c6cb64' ] ] );
		} );
	} );
} );
