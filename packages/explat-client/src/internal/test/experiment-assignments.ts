/**
 * Internal dependencies
 */
import * as ExperimentAssignments from '../experiment-assignments';
import { validExperimentAssignment } from '../test-common';

describe( 'isAlive', () => {
	it( 'returns true for ExperimentAssignments within ttl', () => {
		expect(
			ExperimentAssignments.isAlive( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now(),
			} )
		).toBe( true );
		expect(
			ExperimentAssignments.isAlive( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now() - 1000 * 59,
			} )
		).toBe( true );
	} );
	it( 'returns false for ExperimentAssignments outside of ttl', () => {
		expect(
			ExperimentAssignments.isAlive( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now() - 1000 * 60,
			} )
		).toBe( false );
	} );
} );

describe( 'createFallbackExperimentAssignment', () => {
	it( 'creates a fallback ExperimentAssignment', () => {
		const now = Date.now();
		const fallbackExperimentAssignment = ExperimentAssignments.createFallbackExperimentAssignment(
			'experiment_name'
		);

		expect( fallbackExperimentAssignment.retrievedTimestamp ).toBeGreaterThanOrEqual( now );
		expect( ExperimentAssignments.isAlive( fallbackExperimentAssignment ) ).toBe( true );

		expect( {
			...fallbackExperimentAssignment,
			retrievedTimestamp: now,
		} ).toEqual( {
			experimentName: 'experiment_name',
			variationName: null,
			retrievedTimestamp: now,
			ttl: ExperimentAssignments.minimumTtl,
			isFallbackExperimentAssignment: true,
		} );
	} );

	it( 'creates a fallback ExperimentAssignment correctly with a provided ttl under the minimum', () => {
		const now = Date.now();
		const fallbackExperimentAssignment = ExperimentAssignments.createFallbackExperimentAssignment(
			'experiment_name',
			ExperimentAssignments.minimumTtl - 1
		);
		expect( {
			...fallbackExperimentAssignment,
			retrievedTimestamp: now,
		} ).toEqual( {
			experimentName: 'experiment_name',
			variationName: null,
			retrievedTimestamp: now,
			ttl: ExperimentAssignments.minimumTtl,
			isFallbackExperimentAssignment: true,
		} );
	} );

	it( 'creates a fallback ExperimentAssignment correctly with a provided ttl over the minimum', () => {
		const now = Date.now();
		const fallbackExperimentAssignment = ExperimentAssignments.createFallbackExperimentAssignment(
			'experiment_name',
			ExperimentAssignments.minimumTtl + 1
		);
		expect( {
			...fallbackExperimentAssignment,
			retrievedTimestamp: now,
		} ).toEqual( {
			experimentName: 'experiment_name',
			variationName: null,
			retrievedTimestamp: now,
			ttl: ExperimentAssignments.minimumTtl + 1,
			isFallbackExperimentAssignment: true,
		} );
	} );
} );
