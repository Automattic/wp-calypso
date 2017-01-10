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
	VIDEO_STATS_RECEIVE,
	VIDEO_STATS_REQUEST,
	VIDEO_STATS_REQUEST_FAILURE,
	VIDEO_STATS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { requesting, items } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: VIDEO_STATS_REQUEST,
				siteId: 2916284,
				videoId: 2454,
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: true
				}
			} );
		} );

		it( 'should accumulate requesting values (videoId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: VIDEO_STATS_REQUEST,
				siteId: 2916284,
				videoId: 2455
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: true,
					2455: true,
				}
			} );
		} );

		it( 'should accumulate requesting values (siteId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: VIDEO_STATS_REQUEST,
				siteId: 2916285,
				videoId: 2454
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: true,
				},
				2916285: {
					2454: true,
				}
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: VIDEO_STATS_REQUEST_SUCCESS,
				siteId: 2916284,
				videoId: 2454,
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: false
				}
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: VIDEO_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				videoId: 2454,
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: false
				}
			} );
		} );

		it( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: true
				}
			}	);
			const state = requesting( previousState, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index video stats by site ID, video id and stat', () => {
			const state = items( null, {
				type: VIDEO_STATS_RECEIVE,
				siteId: 2916284,
				videoId: 2454,
				stats: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			} );
		} );

		it( 'should overwrites previous stats for the same videoId, siteId', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			}	);
			const state = items( previousState, {
				type: VIDEO_STATS_RECEIVE,
				siteId: 2916284,
				videoId: 2454,
				stats: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ]
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ]
				}
			} );
		} );

		it( 'should accumulate video IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			}	);
			const state = items( previousState, {
				type: VIDEO_STATS_RECEIVE,
				siteId: 2916284,
				videoId: 2455,
				stats: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ]
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ],
					2455: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ]
				}
			} );
		} );

		it( 'should accumulate site IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			}	);
			const state = items( previousState, {
				type: VIDEO_STATS_RECEIVE,
				siteId: 2916285,
				videoId: 2454,
				stats: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ],
			} );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				},
				2916285: {
					2454: [ [ '2016-11-11', 2 ], [ '2016-11-12', 3 ] ]
				}
			} );
		} );

		it( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			}	);
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			} );
		} );

		it( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			}	);
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
				}
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
			}	);
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
