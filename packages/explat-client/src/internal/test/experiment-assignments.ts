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

describe( 'isRecent', () => {
	it( 'returns true for ExperimentAssignments within maximumRecencyDelta', () => {
		expect(
			ExperimentAssignments.isRecent( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now(),
			} )
		).toBe( true );
		expect(
			ExperimentAssignments.isRecent( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 14 + 100,
			} )
		).toBe( true );
	} );
	it( 'returns false for ExperimentAssignments outside of maximumRecencyDelta', () => {
		expect(
			ExperimentAssignments.isRecent( {
				...validExperimentAssignment,
				retrievedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
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
		expect( ExperimentAssignments.isRecent( fallbackExperimentAssignment ) ).toBe( true );

		expect( {
			...fallbackExperimentAssignment,
			retrievedTimestamp: now,
		} ).toEqual( {
			experimentName: 'experiment_name',
			variationName: null,
			retrievedTimestamp: now,
			ttl: 60,
			isFallbackExperimentAssignment: true,
		} );
	} );
} );
