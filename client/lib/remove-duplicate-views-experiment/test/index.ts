import { loadExperimentAssignment } from 'calypso/lib/explat';
import { loadRemoveDuplicateViewsExperimentAssignment } from '../index';
import type { AppState } from 'calypso/types';

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

describe( 'loadRemoveDuplicateViewsExperimentAssignment', () => {
	it( 'returns override if present', async () => {
		const mockState = {
			preferences: {
				localValues: {
					remove_duplicate_views_experiment_assignment_160125: 'control',
				},
			},
		} as AppState;
		const result = await loadRemoveDuplicateViewsExperimentAssignment( mockState );
		expect( result ).toBe( 'control' );
	} );

	it( 'calls experiment assignment when no override', async () => {
		const mockState = {} as AppState;

		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( { variationName: 'treatment' } );

		const result = await loadRemoveDuplicateViewsExperimentAssignment( mockState );

		expect( loadExperimentAssignment ).toHaveBeenCalledWith( 'calypso_post_onboarding_aa_150125' );
		expect( loadExperimentAssignment ).toHaveBeenCalledWith(
			'calypso_post_onboarding_holdout_160125'
		);
		expect( result ).toBe( 'treatment' );
	} );
} );
