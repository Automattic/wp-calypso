/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getTerms,
	getTermsForQuery,
	getTermsForQueryIgnoringPage,
	getTermsHierarchyForQueryIgnoringPage,
	getTermsLastPageForQuery,
	isRequestingTermsForQuery
} from '../selectors';

describe( 'selectors', () => {
	beforeEach( () => {
		getTermsForQuery.memoizedSelector.cache.clear();
		getTermsHierarchyForQueryIgnoringPage.memoizedSelector.cache.clear();
	} );

	describe( 'isRequestingTermsForQuery()', () => {
		it( 'should return false if no request exists', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {}
				}
			}, 2916284, 'categories', {} );

			expect( requesting ).to.be.false;
		} );

		it( 'should return false if query is not requesting', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {
						2916284: {
							categories: {
								'{"search":"ribs"}': false
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( requesting ).to.be.false;
		} );

		it( 'should return true if query is in progress', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {
						2916284: {
							categories: {
								'{"search":"ribs"}': true
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'getTermsForQuery()', () => {
		it( 'should return null if no matching query results exist', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {}
				}
			}, 2916284, 'categories', {} );

			expect( terms ).to.be.null;
		} );

		it( 'should return an empty array if no matches exist', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': []
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [] );
		} );

		it( 'should return matching terms', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': [ 111 ]
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit'
				}
			] );
		} );
	} );

	describe( 'getTermsForQueryIgnoringPage', () => {
		it( 'should return null if last page is not known', () => {
			const terms = getTermsForQueryIgnoringPage( {
				terms: {
					queriesLastPage: {}
				}
			}, 2916284, 'category', { search: 'Hello' } );

			expect( terms ).to.be.null;
		} );

		it( 'should return terms ignoring page param', () => {
			const terms = getTermsForQueryIgnoringPage( {
				terms: {
					queriesLastPage: {
						2916284: {
							category: {
								'{"search":"hello"}': 2
							}
						}
					},
					queries: {
						2916284: {
							category: {
								'{"search":"hello"}': [ 123 ],
								'{"search":"hello","page":2}': [ 124 ]
							}
						}
					},
					items: {
						2916284: {
							category: {
								123: {
									ID: 123,
									name: 'Chicken',
									slug: 'chicken'
								},
								124: {
									ID: 124,
									name: 'Ribs',
									slug: 'ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'category', { search: 'Hello', page: 2 } );

			expect( terms ).to.eql( [ {
				ID: 123,
				name: 'Chicken',
				slug: 'chicken'
			}, {
				ID: 124,
				name: 'Ribs',
				slug: 'ribs'
			} ] );
		} );
	} );

	describe( 'getTermsLastPageForQuery()', () => {
		it( 'should return null if the terms query is not tracked', () => {
			const lastPage = getTermsLastPageForQuery( {
				terms: {
					queriesLastPage: {}
				}
			}, 2916284, 'category', { search: 'Hello' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a query', () => {
			const lastPage = getTermsLastPageForQuery( {
				terms: {
					queriesLastPage: {
						2916284: {
							category: {
								'{"search":"hello"}': 4
							}
						}
					}
				}
			}, 2916284, 'category', { search: 'Hello' } );

			expect( lastPage ).to.equal( 4 );
		} );

		it( 'should return the last page value for a terms query, even if including page param', () => {
			const lastPage = getTermsLastPageForQuery( {
				terms: {
					queriesLastPage: {
						2916284: {
							category: {
								'{"search":"hello"}': 4
							}
						}
					}
				}
			}, 2916284, 'category', { search: 'Hello', page: 2 } );

			expect( lastPage ).to.equal( 4 );
		} );
	} );

	describe( 'getTermsHierarchyForQueryIgnoringPage()', () => {
		it( 'should return null if no matching query results exist', () => {
			const terms = getTermsHierarchyForQueryIgnoringPage( {
				terms: {
					queries: {}
				}
			}, 2916284, 'categories', {} );

			expect( terms ).to.be.null;
		} );

		it( 'should return an empty array if no matches exist', () => {
			const terms = getTermsHierarchyForQueryIgnoringPage( {
				terms: {
					queriesLastPage: {
						2916284: {
							categories: {
								'{"search":"ribs"}': 1
							}
						}
					},
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': []
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs',
									parent: 111
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [] );
		} );

		it( 'should return matching terms in hierarchical structure', () => {
			const terms = getTermsHierarchyForQueryIgnoringPage( {
				terms: {
					queriesLastPage: {
						2916284: {
							categories: {
								'{"search":"ribs"}': 1
							}
						}
					},
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': [ 111, 112 ]
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs',
									parent: 111
								},
								113: {
									ID: 113,
									name: 'Cornbread',
									parent: 111
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit',
					parent: 0,
					items: [ {
						ID: 112,
						name: 'Ribs',
						parent: 111
					} ]
				}
			] );
		} );
	} );

	describe( 'getTerms()', () => {
		it( 'should return null if no site exists', () => {
			const terms = getTerms( {}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.be.null;
		} );

		it( 'should return null if no taxonomies exist for site', () => {
			const terms = getTerms( {
				terms: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								}
							}
						}
					}
				}
			}, 2916284, 'jetpack-testimonials' );

			expect( terms ).to.be.null;
		} );

		it( 'should return array of matching terms for site taxonomy combo', () => {
			const terms = getTerms( {
				terms: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit'
				}, {
					ID: 112,
					name: 'Ribs'
				}
			] );
		} );
	} );
} );
