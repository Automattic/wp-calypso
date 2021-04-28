/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import ExperimentAssignmentStore from '../experiment-assignment-store';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

beforeEach( () => {
	window.localStorage.clear();
} );

describe( 'experiment-assignment-store', () => {
	it( 'should save and retrieve valid ExperimentAssignments', () => {
		const experimentAssignmentStore = new ExperimentAssignmentStore();
		expect( experimentAssignmentStore.retrieve( validExperimentAssignment.experimentName ) ).toBe(
			undefined
		);
		experimentAssignmentStore.store( validExperimentAssignment );
		expect(
			experimentAssignmentStore.retrieve( validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );

		expect(
			experimentAssignmentStore.retrieve( validFallbackExperimentAssignment.experimentName )
		).toBe( undefined );
		experimentAssignmentStore.store( validFallbackExperimentAssignment );
		expect(
			experimentAssignmentStore.retrieve( validFallbackExperimentAssignment.experimentName )
		).toEqual( validFallbackExperimentAssignment );
	} );

	it( 'should throw for storing an ExperimentAssignment for a currently stored Experiment with an older date', () => {
		const experimentAssignmentStore = new ExperimentAssignmentStore();
		experimentAssignmentStore.store( validFallbackExperimentAssignment );
		expect(
			experimentAssignmentStore.retrieve( validFallbackExperimentAssignment.experimentName )
		).toStrictEqual( validFallbackExperimentAssignment );
		expect( () =>
			experimentAssignmentStore.store( {
				...validFallbackExperimentAssignment,
				retrievedTimestamp: validFallbackExperimentAssignment.retrievedTimestamp - 1,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to store an older experiment assignment than is present in the store, likely a race condition."`
		);
	} );

	it( 'should throw for storing an invalid ExperimentAssignment', () => {
		const experimentAssignmentStore = new ExperimentAssignmentStore();
		expect( () =>
			experimentAssignmentStore.store( {
				...validFallbackExperimentAssignment,
				experimentName: undefined,
			} )
		).toThrowErrorMatchingInlineSnapshot( `"Invalid ExperimentAssignment"` );
	} );
} );
