import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { loadRemoveDuplicateViewsExperimentAssignment } from '../index';

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

const createTestStore = ( state = {} ) => {
	const middlewares = [ thunk ];
	const mockStore = configureStore( middlewares );
	return mockStore( state );
};

describe( 'loadRemoveDuplicateViewsExperimentAssignment', () => {
	it( 'returns override if present', async () => {
		const store = createTestStore( {
			preferences: {
				localValues: {
					remove_duplicate_views_experiment_assignment_160125: 'control',
				},
			},
		} );
		const result = await loadRemoveDuplicateViewsExperimentAssignment(
			store.getState,
			store.dispatch
		);
		expect( result ).toBe( 'control' );
	} );

	it( 'calls experiment assignment when no override', async () => {
		const store = createTestStore( {
			preferences: {},
		} );

		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( { variationName: 'treatment' } );

		const result = await loadRemoveDuplicateViewsExperimentAssignment(
			store.getState,
			store.dispatch
		);

		expect( loadExperimentAssignment ).toHaveBeenCalledWith( 'calypso_post_onboarding_aa_150125' );
		expect( loadExperimentAssignment ).toHaveBeenCalledWith(
			'calypso_post_onboarding_holdout_160125'
		);
		expect( result ).toBe( 'treatment' );
	} );
} );
