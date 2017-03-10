/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	normalizePostForDisplay,
	normalizePostForState,
	normalizePostForApi,
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	getTermIdsFromEdits,
	isTermsEqual,
	mergeIgnoringArrays
} from '../utils';

describe( 'utils', () => {
	describe( 'isTermsEqual', () => {
		it( 'should return false if term edits are the same as saved terms', () => {
			const isEqual = isTermsEqual( {
				post_tag: [ 'ribs', 'chicken' ],
				category: [ {
					ID: 777,
					name: 'amazing food'
				} ]
			}, {
				post_tag: {
					ribs: {
						ID: 11,
						name: 'ribs'
					},
					chicken: {
						ID: 12,
						name: 'chicken'
					}
				},
				category: {
					'amazing-food': {
						ID: 777,
						name: 'amazing food'
					}
				}
			} );
			expect( isEqual ).to.be.true;
		} );

		it( 'should return false if term edits are not the same as saved terms', () => {
			const isEqual = isTermsEqual( {
				post_tag: [ 'ribs' ],
				category: [ {
					ID: 777,
					name: 'amazing food'
				} ]
			}, {
				post_tag: {
					ribs: {
						ID: 11,
						name: 'ribs'
					},
					chicken: {
						ID: 12,
						name: 'chicken'
					}
				},
				category: {
					'amazing-food': {
						ID: 777,
						name: 'amazing food'
					}
				}
			} );
			expect( isEqual ).to.be.false;
		} );

		it( 'should return false savedTerms is missing a taxonomy', () => {
			const isEqual = isTermsEqual( {
				post_tag: [ 'ribs' ]
			}, {} );
			expect( isEqual ).to.be.false;
		} );
	} );

	describe( 'normalizePostForApi()', () => {
		it( 'should return null if post is falsey', () => {
			const normalizedPost = normalizePostForApi();
			expect( normalizedPost ).to.be.null;
		} );

		it( 'should return a normalized post object', () => {
			const post = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					category: [ { ID: 777, name: 'recipes' } ],
					post_tag: [ 'super', 'yummy', 'stuff' ]
				}
			};

			const normalizedPost = normalizePostForApi( post );
			expect( normalizedPost ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					post_tag: [ 'super', 'yummy', 'stuff' ]
				}
			} );
		} );
	} );

	describe( 'normalizePostForDisplay()', () => {
		it( 'should return null if post is falsey', () => {
			const normalizedPost = normalizePostForDisplay();
			expect( normalizedPost ).to.be.null;
		} );

		it( 'should return a normalized post object', () => {
			const post = {
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
				},
			};

			const normalizedPost = normalizePostForDisplay( post );
			expect( normalizedPost ).to.eql( {
				...post,
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

	describe( 'normalizePostForState()', () => {
		it( 'should deeply unset all meta', () => {
			const original = deepFreeze( {
				ID: 814,
				meta: {},
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {}
						}
					},
					post_tag: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {}
						}
					}
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {}
					}
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {}
					}
				},
				attachments: {
					14209: {
						ID: 14209,
						meta: {}
					}
				}
			} );
			const revised = normalizePostForState( original );

			expect( revised ).to.not.equal( original );
			expect( revised ).to.eql( {
				ID: 814,
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta'
						}
					},
					post_tag: {
						meta: {
							ID: 171,
							name: 'meta'
						}
					}
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta'
					}
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta'
					}
				},
				attachments: {
					14209: {
						ID: 14209
					}
				}
			} );
		} );
	} );

	describe( '#getNormalizedPostsQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedPostsQuery( {
				page: 4,
				number: 20
			} );

			expect( query ).to.eql( {
				page: 4
			} );
		} );
	} );

	describe( '#getSerializedPostsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedPostsQuery( {
				type: 'page',
				page: 1
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'Hello'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedPostsQueryDetails()', () => {
		it( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( 'bad' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: undefined
			} );
		} );

		it( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: { search: 'hello' }
			} );
		} );

		it( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: 2916284,
				query: { search: 'hello' }
			} );
		} );
	} );

	describe( '#getSerializedPostsQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				type: 'page',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'Hello',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'mergeIgnoringArrays()', () => {
		it( 'should merge into an empty object', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should not modify array properties in the original object', () => {
			const merged = mergeIgnoringArrays( {
				tags_by_id: [ 4, 5, 6 ]
			}, {} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should allow removing array items', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 4, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 6 ]
			} );
		} );

		it( 'should replace arrays with the new value', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );
		} );
	} );

	describe( '#getTermIdsFromEdits()', () => {
		it( 'should return the same post edit object if no term edits have been made', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves'
			} );

			expect( normalizedPostEdits ).to.eql( {
				title: 'Chewbacca Saves'
			} );
		} );

		it( 'should return the add terms_by_id if terms have been edited', () => {
			const originalPost = deepFreeze( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce'
						}
					}
				}
			} );

			const normalizedPostEdits = getTermIdsFromEdits( originalPost );

			expect( normalizedPostEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce'
						}
					}
				},
				terms_by_id: {
					wookie_post_types: [ 777 ]
				}
			} );
		} );

		it( 'should taxonomy terms_by_id to null if object is empty', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {}
				}
			} );

			expect( normalizedPostEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {}
				},
				terms_by_id: {
					wookie_post_types: null
				}
			} );
		} );

		it( 'should not set terms_by_id for taxonomies that set an array on terms', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_tags: [ 'raaar', 'uggggaaarr' ]
				}
			} );

			expect( normalizedPostEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_tags: [ 'raaar', 'uggggaaarr' ]
				}
			} );
		} );
	} );
} );
