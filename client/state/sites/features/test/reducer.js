import { expect } from 'chai';
import {
	SITE_FEATURES_FETCH,
	SITE_FEATURES_FETCH_COMPLETED,
	SITE_FEATURES_FETCH_FAILED,
} from 'calypso/state/action-types';
import { featuresReducer as features } from '../reducer';

describe( 'reducer', () => {
	describe( '#features()', () => {
		test( 'should return an empty state when original state is undefined and action is empty', () => {
			const state = features( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should return an empty state when original state and action are empty', () => {
			const original = Object.freeze( {} );
			const state = features( original, {} );

			expect( state ).to.eql( original );
		} );

		test( 'should return an empty state when original state is undefined and action is unknown', () => {
			const state = features( undefined, {
				type: 'UNKNOWN_ACTION',
				siteId: 11111111,
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should return the original state when action is unknown', () => {
			const original = Object.freeze( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
			const state = features( original, {
				type: 'UNKNOWN_ACTION',
				siteId: 11111111,
			} );

			expect( state ).to.eql( original );
		} );

		test( 'should return the initial state with requesting enabled when fetching is triggered', () => {
			const state = features( undefined, {
				type: SITE_FEATURES_FETCH,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should return the original state with an error and requesting disabled when fetching failed', () => {
			const original = Object.freeze( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: true,
				},
			} );
			const state = features( original, {
				type: SITE_FEATURES_FETCH_FAILED,
				siteId: 11111111,
				error: 'Unable to fetch site features',
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {},
					error: 'Unable to fetch site features',
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );

		test( 'should return a list of features with loaded from server enabled and requesting disabled when fetching completed', () => {
			const state = features( undefined, {
				type: SITE_FEATURES_FETCH_COMPLETED,
				siteId: 11111111,
				features: {
					active: [ 'active-01', 'active-03', 'active-03' ],
					available: {
						available_01: [ 'plan-01_01', 'plan-01_02', 'plan-01_03' ],
						available_02: [ 'plan-02_01', 'plan-02_02', 'plan-02_03' ],
						available_03: [ 'plan-03_01', 'plan-03_02', 'plan-03_03' ],
					},
				},
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {
						active: [ 'active-01', 'active-03', 'active-03' ],
						available: {
							available_01: [ 'plan-01_01', 'plan-01_02', 'plan-01_03' ],
							available_02: [ 'plan-02_01', 'plan-02_02', 'plan-02_03' ],
							available_03: [ 'plan-03_01', 'plan-03_02', 'plan-03_03' ],
						},
					},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );

		test( 'should accumulate features for different sites', () => {
			const original = Object.freeze( {
				11111111: {
					data: {
						active: [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ],
						available: {
							feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
							feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
							feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
						},
					},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );

			const state = features( original, {
				type: SITE_FEATURES_FETCH,
				siteId: 55555555,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {
						active: [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ],
						available: {
							feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
							feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
							feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
						},
					},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
				55555555: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should override previous features of the same site', () => {
			const original = Object.freeze( {
				11111111: {
					data: {
						active: [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ],
						available: {
							feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
							feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
							feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
						},
					},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
			const state = features( original, {
				type: SITE_FEATURES_FETCH,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {
						active: [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ],
						available: {
							feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
							feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
							feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
						},
					},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: true,
				},
			} );
		} );
	} );
} );
