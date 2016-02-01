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
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_TRIAL_CANCEL,
	SITE_PLANS_TRIAL_CANCEL_FAILED,
	SITE_PLANS_TRIAL_CANCEL_COMPLETED,
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
						isFetching: false,
						isUpdating: false
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
					isFetching: true,
					isUpdating: false
				}
			} );
		} );

		it( 'should return the original state with an error and fetching disabled when fetching failed', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: true,
						isUpdating: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_FETCH_FAILED,
					siteId: 11111111,
					error: 'Unable to fetch site plans'
				} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: 'Unable to fetch site plans',
					hasLoadedFromServer: true,
					isFetching: false,
					isUpdating: false
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
					isFetching: false,
					isUpdating: false
				}
			} );
		} );

		it( 'should accumulate plans for different sites', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false,
						isUpdating: false
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
					isFetching: false,
					isUpdating: false
				},
				55555555: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isFetching: true,
					isUpdating: false
				}
			} );
		} );

		it( 'should override previous plans of the same site', () => {
			const original = Object.freeze( {
					11111111: {
						data: null,
						error: 'Unable to fetch site plans',
						hasLoadedFromServer: false,
						isFetching: false,
						isUpdating: false
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
					isFetching: true,
					isUpdating: false
				}
			} );
		} );

		it( 'should return the original state with updating enabled when trial cancelation is triggered', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: false,
						isFetching: false,
						isUpdating: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_TRIAL_CANCEL,
					siteId: 11111111
				} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: null,
					hasLoadedFromServer: false,
					isFetching: false,
					isUpdating: true
				}
			} );
		} );

		it( 'should return the original state with an error and updating disabled when trial cancelation failed', () => {
			const original = Object.freeze( {
					11111111: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false,
						isUpdating: false
					}
				} ),
				state = plans( original, {
					type: SITE_PLANS_TRIAL_CANCEL_FAILED,
					siteId: 11111111,
					error: 'Unable to cancel plan trial'
				} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: 'Unable to cancel plan trial',
					hasLoadedFromServer: true,
					isFetching: false,
					isUpdating: false
				}
			} );
		} );

		it( 'should return a list of plans as well as loaded from server enabled and updating disabled when trial cancelation completed', () => {
			const state = plans( undefined, {
				type: SITE_PLANS_TRIAL_CANCEL_COMPLETED,
				siteId: 11111111,
				plans: []
			} );

			expect( state ).to.eql( {
				11111111: {
					data: [],
					error: null,
					hasLoadedFromServer: true,
					isFetching: false,
					isUpdating: false
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
						isFetching: false,
						isUpdating: false
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
						isFetching: false,
						isUpdating: false
					},
					22222222: {
						data: [],
						error: null,
						hasLoadedFromServer: true,
						isFetching: false,
						isUpdating: false
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
					isFetching: false,
					isUpdating: false
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
