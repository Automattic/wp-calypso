/**
 * Internal dependencies
 */
import * as State from '../state';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

describe( 'state', () => {
	it( 'should save and retrieve valid ExperimentAssignments', () => {
		expect( State.retrieveExperimentAssignment( validExperimentAssignment.experimentName ) ).toBe(
			undefined
		);
		State.storeExperimentAssignment( validExperimentAssignment );
		expect(
			State.retrieveExperimentAssignment( validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );

		expect(
			State.retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName )
		).toBe( undefined );
		State.storeExperimentAssignment( validFallbackExperimentAssignment );
		expect(
			State.retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName )
		).toEqual( validFallbackExperimentAssignment );
	} );

	it( 'should throw for storing an ExperimentAssignment for a currently stored Experiment with an older date', () => {
		expect(
			State.retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName )
		).toBe( validFallbackExperimentAssignment );
		expect( () =>
			State.storeExperimentAssignment( {
				...validFallbackExperimentAssignment,
				retrievedTimestamp: validFallbackExperimentAssignment.retrievedTimestamp - 1,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to store an older experiment assignment than is present in the store, likely a race condition."`
		);
	} );

	it( 'should throw for overwriting a recent ExperimentAssignment with a fallback', () => {
		expect( State.retrieveExperimentAssignment( validExperimentAssignment.experimentName ) ).toBe(
			validExperimentAssignment
		);
		expect( () =>
			State.storeExperimentAssignment( {
				...validExperimentAssignment,
				isFallbackExperimentAssignment: true,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Replacing recent ExperimentAssignment with fallback ExperimentAssignment."`
		);
	} );
} );
