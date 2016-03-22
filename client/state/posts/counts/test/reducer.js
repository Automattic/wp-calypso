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
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	requesting,
	counts
} from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'counts'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track request fetching', () => {
			const state = requesting( undefined, {
				type: POST_COUNTS_REQUEST,
				siteId: 2916284,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true
				}
			} );
		} );

		it( 'should accumulate requests for the same site', () => {
			const original = deepFreeze( {
				2916284: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_COUNTS_REQUEST,
				siteId: 2916284,
				postType: 'page'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true
				}
			} );
		} );

		it( 'should accumulate requests for distinct sites', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true
				}
			} );
			const state = requesting( original, {
				type: POST_COUNTS_REQUEST,
				siteId: 77203074,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should track request success', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_COUNTS_REQUEST_SUCCESS,
				siteId: 2916284,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: true
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should track request failure', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: true
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_COUNTS_REQUEST_FAILURE,
				siteId: 2916284,
				postType: 'page'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#counts()', () => {
		it( 'should default to an empty object', () => {
			const state = counts( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track received post counts by type', () => {
			const state = counts( undefined, {
				type: POST_COUNTS_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				counts: {
					all: { publish: 2 },
					mine: { publish: 1 }
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					post: {
						all: { publish: 2 },
						mine: { publish: 1 }
					}
				}
			} );
		} );

		it( 'should accumulate received post counts for site', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						all: { publish: 2 },
						mine: { publish: 1 }
					}
				}
			} );
			const state = counts( original, {
				type: POST_COUNTS_RECEIVE,
				siteId: 2916284,
				postType: 'page',
				counts: {
					all: { publish: 12 },
					mine: { publish: 11 }
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					post: {
						all: { publish: 2 },
						mine: { publish: 1 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
		} );

		it( 'should replace received post counts for site type', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						all: { publish: 2 },
						mine: { publish: 1 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
			const state = counts( original, {
				type: POST_COUNTS_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				counts: {
					all: { publish: 3 },
					mine: { publish: 2 }
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					post: {
						all: { publish: 3 },
						mine: { publish: 2 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						all: { publish: 3 },
						mine: { publish: 2 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
			const state = counts( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						all: { publish: 3 },
						mine: { publish: 2 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
			const state = counts( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						all: { publish: true },
						mine: { publish: 2 }
					},
					page: {
						all: { publish: 12 },
						mine: { publish: 11 }
					}
				}
			} );
			const state = counts( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
