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
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	getTermIdsFromEdits,
	mergeIgnoringArrays
} from '../utils';

describe( 'utils', () => {
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
				featured_image: 'https://example.com/logo.png'
			};

			const normalizedPost = normalizePostForDisplay( post );
			expect( normalizedPost ).to.eql( {
				...post,
				title: 'Ribs & Chicken',
				author: {
					name: 'Badman '
				},
				canonical_image: {
					type: 'image',
					uri: 'https://example.com/logo.png'
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
						Code: {
							ID: 6,
							meta: {}
						}
					}
				}
			} );
			const revised = normalizePostForState( original );

			expect( revised ).to.not.equal( original );
			expect( revised ).to.eql( {
				ID: 814,
				meta: null,
				terms: {
					category: {
						Code: {
							ID: 6,
							meta: null
						}
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
