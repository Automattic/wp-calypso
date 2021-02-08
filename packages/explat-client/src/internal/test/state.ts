/**
 * Internal dependencies
 */
import * as State from '../state';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

describe( 'state', () => {
	it( 'should save and retrieve valid ExperimentAssignments', () => {
		const store = State.createStore();
		expect(
			State.retrieveExperimentAssignment( store, validExperimentAssignment.experimentName )
		).toBe( undefined );
		State.storeExperimentAssignment( store, validExperimentAssignment );
		expect(
			State.retrieveExperimentAssignment( store, validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );

		expect(
			State.retrieveExperimentAssignment( store, validFallbackExperimentAssignment.experimentName )
		).toBe( undefined );
		State.storeExperimentAssignment( store, validFallbackExperimentAssignment );
		expect(
			State.retrieveExperimentAssignment( store, validFallbackExperimentAssignment.experimentName )
		).toEqual( validFallbackExperimentAssignment );
	} );

	it( 'should throw for storing an ExperimentAssignment for a currently stored Experiment with an older date', () => {
		const store = State.createStore();
		State.storeExperimentAssignment( store, validFallbackExperimentAssignment );
		expect(
			State.retrieveExperimentAssignment( store, validFallbackExperimentAssignment.experimentName )
		).toBe( validFallbackExperimentAssignment );
		expect( () =>
			State.storeExperimentAssignment( store, {
				...validFallbackExperimentAssignment,
				retrievedTimestamp: validFallbackExperimentAssignment.retrievedTimestamp - 1,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to store an older experiment assignment than is present in the store, likely a race condition."`
		);
	} );
} );
