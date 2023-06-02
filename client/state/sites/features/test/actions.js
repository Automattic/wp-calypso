import { SITE_FEATURES_FETCH_COMPLETED } from 'calypso/state/action-types';
import { fetchSiteFeaturesCompleted } from '../actions';

describe( 'actions', () => {
	describe( '#fetchSiteFeaturesCompleted()', () => {
		test( 'should return an action object with an empty features object when no response', () => {
			const action = fetchSiteFeaturesCompleted( 123001 );

			expect( action ).toEqual( {
				type: SITE_FEATURES_FETCH_COMPLETED,
				siteId: 123001,
				features: {
					active: [],
					available: {},
				},
			} );
		} );

		test( 'should return an action object with an empty features object when empty response', () => {
			const action = fetchSiteFeaturesCompleted( 123001, {} );

			expect( action ).toEqual( {
				type: SITE_FEATURES_FETCH_COMPLETED,
				siteId: 123001,
				features: {
					active: [],
					available: {},
				},
			} );
		} );

		test( 'should return an action object with an array of features', () => {
			const active_a = [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ];
			const available_a = {
				feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
				feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
				feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
			};

			const features_a = {
				active: active_a,
				available: available_a,
			};

			const action = fetchSiteFeaturesCompleted( 123001, features_a );

			expect( action ).toEqual( {
				type: SITE_FEATURES_FETCH_COMPLETED,
				siteId: 123001,
				features: features_a,
			} );
		} );
	} );
} );
