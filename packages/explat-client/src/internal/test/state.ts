/**
 * Internal dependencies
 */
import * as State from '../state';
import { validExperimentAssignmentA, validExperimentAssignmentB } from '../test-common';

describe( 'state', () => {
	it( 'should save and retrieve valid EAs', () => {
		expect( State.retrieveExperimentAssignment( validExperimentAssignmentA.experimentName ) ).toBe(
			undefined
		);
		State.storeExperimentAssignment( validExperimentAssignmentA );
		expect(
			State.retrieveExperimentAssignment( validExperimentAssignmentA.experimentName )
		).toEqual( validExperimentAssignmentA );

		expect( State.retrieveExperimentAssignment( validExperimentAssignmentB.experimentName ) ).toBe(
			undefined
		);
		State.storeExperimentAssignment( validExperimentAssignmentB );
		expect(
			State.retrieveExperimentAssignment( validExperimentAssignmentB.experimentName )
		).toEqual( validExperimentAssignmentB );
	} );

	it( 'should throw for storing an EA for a currently stored Experiment with an older date', () => {
		expect( State.retrieveExperimentAssignment( validExperimentAssignmentB.experimentName ) ).toBe(
			validExperimentAssignmentB
		);
		expect( () =>
			State.storeExperimentAssignment( {
				...validExperimentAssignmentB,
				retrievedTimestamp: validExperimentAssignmentB.retrievedTimestamp - 1,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to store an older experiment assignment than is present in the store, likely a race condition."`
		);
	} );

	it( 'should throw for overwriting a recent EA with a fallback', () => {
		expect( State.retrieveExperimentAssignment( validExperimentAssignmentA.experimentName ) ).toBe(
			validExperimentAssignmentA
		);
		expect( () =>
			State.storeExperimentAssignment( {
				...validExperimentAssignmentA,
				isFallbackExperimentAssignment: true,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Replacing recent ExperimentAssignment with fallback ExperimentAssignment."`
		);
	} );
} );
