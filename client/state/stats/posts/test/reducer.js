/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { requesting, items as unwrappedItems } from '../reducer';
import { withSchemaValidation } from 'state/utils';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views', 'years' ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {
						'views,years': true
					}
				}
			} );
		} );

		it( 'should accumulate requesting values (stat)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true }
				}
			}	);
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'countComments' ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {
						views: true,
						countComments: true
					}
				}
			} );
		} );

		it( 'should accumulate requesting values (postId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true }
				}
			}	);
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2455,
				fields: [ 'views' ]
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {	views: true },
					2455: {	views: true }
				}
			} );
		} );

		it( 'should accumulate requesting values (siteId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true }
				}
			}	);
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916285,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {	views: true }
				},
				2916285: {
					2454: {	views: true }
				}
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true }
				}
			}	);
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST_SUCCESS,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: { views: false }
				}
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true }
				}
			}	);
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: { views: false }
				}
			} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index post stats by site ID, post id and stat', () => {
			const state = items( null, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { views: 2, years: [] },
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: { views: 2, years: [] }
				}
			} );
		} );

		it( 'should accumulate stats', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { countComments: 3 },
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {
						views: 2,
						countComments: 3
					}
				}
			} );
		} );

		it( 'should accumulate post IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2455,
				stats: { views: 3 },
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {	views: 2 },
					2455: {	views: 3 }
				}
			} );
		} );

		it( 'should accumulate site IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916285,
				postId: 2454,
				stats: { views: 3 },
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {	views: 2 }
				},
				2916285: {
					2454: {	views: 3 }
				}
			} );
		} );

		it( 'should override previous stat value of same site ID, post ID and stat key', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { views: 3 },
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: {	views: 3 }
				}
			} );
		} );

		it( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					2454: { views: 2 }
				}
			} );
		} );

		it( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 }
				}
			}	);
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					2454: { views: 2 }
				}
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: { views: 2 }
			}	);
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
