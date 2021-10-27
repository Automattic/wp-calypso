/**
 * @jest-environment jsdom
 */

import {
	retrieveExperimentAssignment,
	storeExperimentAssignment,
	removeExpiredExperimentAssignments,
} from '../experiment-assignment-store';
import localStorage from '../local-storage';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

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

	it( 'should remove all stored ExperimentAssignments that are past their ttl', () => {
		storeExperimentAssignment( {
			...validExperimentAssignment,
			retrievedTimestamp: Date.now() - 1000 * 60,
		} );
		storeExperimentAssignment( {
			...validExperimentAssignment,
			experimentName: 'experiment2',
			retrievedTimestamp: Date.now() - 1000 * 61,
		} );
		storeExperimentAssignment( {
			...validExperimentAssignment,
			experimentName: 'experiment3',
			retrievedTimestamp: Date.now() - 1000 * 65,
		} );
		removeExpiredExperimentAssignments();
		expect( localStorage.length ).toBe( 0 );

		storeExperimentAssignment( {
			...validExperimentAssignment,
			experimentName: 'experiment4',
			retrievedTimestamp: Date.now() - 1000 * 60,
		} );
		storeExperimentAssignment( validExperimentAssignment );
		removeExpiredExperimentAssignments();
		expect( localStorage.length ).toBe( 1 );
	} );
} );
