/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import {
	retrieveExperimentAssignment,
	storeExperimentAssignment,
} from '../experiment-assignment-store';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';
import localStorage from '../local-storage';

beforeEach( () => {
	localStorage.clear();
} );

describe( 'experiment-assignment-store', () => {
	it( 'should save and retrieve valid ExperimentAssignments', () => {
		expect( retrieveExperimentAssignment( validExperimentAssignment.experimentName ) ).toBe(
			undefined
		);
		storeExperimentAssignment( validExperimentAssignment );
		expect(
			retrieveExperimentAssignment( validExperimentAssignment.experimentName )
		).toStrictEqual( validExperimentAssignment );

		expect( retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName ) ).toBe(
			undefined
		);
		storeExperimentAssignment( validFallbackExperimentAssignment );
		expect(
			retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName )
		).toStrictEqual( validFallbackExperimentAssignment );
	} );

	it( 'should throw for storing an ExperimentAssignment for a currently stored Experiment with an older date', () => {
		storeExperimentAssignment( validFallbackExperimentAssignment );
		expect(
			retrieveExperimentAssignment( validFallbackExperimentAssignment.experimentName )
		).toStrictEqual( validFallbackExperimentAssignment );
		expect( () =>
			storeExperimentAssignment( {
				...validFallbackExperimentAssignment,
				retrievedTimestamp: validFallbackExperimentAssignment.retrievedTimestamp - 1,
			} )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to store an older experiment assignment than is present in the store, likely a race condition."`
		);
	} );

	it( 'should throw for storing an invalid ExperimentAssignment', () => {
		expect( () =>
			storeExperimentAssignment( {
				...validFallbackExperimentAssignment,
				experimentName: undefined,
			} )
		).toThrowErrorMatchingInlineSnapshot( `"Invalid ExperimentAssignment"` );
	} );
} );
