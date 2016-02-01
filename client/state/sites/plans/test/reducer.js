/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_REMOVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { plans } from '../reducer';

describe( 'reducer', () => {
	describe( '#plans()', () => {
		it( 'should return an empty state when original state is undefined and action is empty', () => {
			const state = plans( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should return an empty state when original state and action are empty', () => {
			const original = Object.freeze( {} ),
				state = plans( original, {} );

			expect( state ).to.eql( original );
		} );

		it( 'should return an empty state when original state is undefined and action is unknown', () => {
			const state = plans( undefined, {
				type: 'SAY_HELLO',
				siteId: 11111111
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should return the original state when action is unknown', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false
					}
				} ),
				state = plans( original, {
					type: 'MAKE_COFFEE',
					siteId: 11111111
				} );

			expect( state ).to.eql( original );
		} );

		it( 'should return the initial state with fetching enabled when fetching is triggered', () => {
			const state = plans( undefined, {
				type: SITE_PLANS_FETCH,
				siteId: 11111111
			} );

			expect( state ).to.eql( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isFetching: true
				}
			} );
		} );

		it( 'should return a list of plans as well as loaded from server enabled and fetching disabled when fetching completed', () => {
			const state = plans( undefined, {
				type: SITE_PLANS_FETCH_COMPLETED,
				siteId: 11111111,
				plans: []
			} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: null,
					hasLoadedFromServer: true,
					isFetching: false
				}
			} );
		} );

		it( 'should accumulate plans for different sites', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_FETCH,
					siteId: 55555555
				} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: null,
					hasLoadedFromServer: true,
					isFetching: false
				},
				55555555: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isFetching: true
				}
			} );
		} );

		it( 'should override previous plans of the same site', () => {
			const original = Object.freeze( {
					11111111: {
						data: null,
						error: 'Unable to fetch site plans',
						hasLoadedFromServer: false,
						isFetching: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_FETCH,
					siteId: 11111111
				} );

			expect( state ).to.eql( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isFetching: true
				}
			} );
		} );

		it( 'should return an empty state when original state is undefined and removal is triggered', () => {
			const state = plans( undefined, {
				type: SITE_PLANS_REMOVE,
				siteId: 11111111
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should return the original state when removal is triggered for an unknown site', () => {
			const original = Object.freeze( {
					11111111: {
						data: null,
						error: 'Unable to fetch site plans',
						hasLoadedFromServer: false,
						isFetching: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_REMOVE,
					siteId: 22222222
				} );

			expect( state ).to.eql( original );
		} );

		it( 'should remove plans for a given site when removal is triggered', () => {
			const original = Object.freeze( {
					11111111: {
						data: null,
						error: 'Unable to fetch site plans',
						hasLoadedFromServer: false,
						isFetching: false
					},
					22222222: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_REMOVE,
					siteId: 11111111
				} );

			expect( state ).to.eql( {
				22222222: {
					data: [],
					error: null,
					hasLoadedFromServer: true,
					isFetching: false
				}
			} );
		} );

		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				11111111: initialSiteState,
				22222222: initialSiteState
			} );
			const state = plans( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				11111111: initialSiteState,
				22222222: initialSiteState
			} );
			const state = plans( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );
} );
