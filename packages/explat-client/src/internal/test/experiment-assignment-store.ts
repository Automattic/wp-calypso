/**
 * @jest-environment jsdom
 */

import {
	retrieveExperimentAssignment,
	storeExperimentAssignment,
	removeExpiredExperimentAssignments,
	localStorageExperimentAssignmentKeyPrefix,
	localStorageExperimentAssignmentKey,
	getAllLocalStorageKeys,
	isLocalStorageExperimentAssignmentKey,
	experimentNameFromLocalStorageExperimentAssignmentKey,
} from '../experiment-assignment-store';
import localStorage from '../local-storage';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

beforeEach( () => {
	localStorage.clear();
} );

describe( 'storeExperimentAssignment and retrieveExperimentAssignment', () => {
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
			'"Trying to store an older experiment assignment than is present in the store, likely a race condition."'
		);
	} );

	it( 'should throw for storing an invalid ExperimentAssignment', () => {
		expect( () =>
			storeExperimentAssignment( {
				...validFallbackExperimentAssignment,
				experimentName: undefined,
			} )
		).toThrowErrorMatchingInlineSnapshot( '"Invalid ExperimentAssignment"' );
	} );
} );

describe( 'getAllLocalStorageKeys', () => {
	it( 'should return an empty array if there are no stored keys', () => {
		expect( getAllLocalStorageKeys().length ).toBe( 0 );
	} );

	it( 'should return an array of all of the stored keys', () => {
		const keys = [ 'key1', 'key2', 'key3', 'key4', 'key5' ];
		keys.map( ( key ) => localStorage.setItem( key, 'test value' ) );
		const result = getAllLocalStorageKeys();
		expect( result ).toStrictEqual( keys );
	} );
} );

describe( 'isLocalStorageExperimentAssignmentKey', () => {
	it( 'should return false if key is an empty string', () => {
		expect( isLocalStorageExperimentAssignmentKey( '' ) ).toBe( false );
	} );

	it( 'should return false if key is shorter than the experiment assignment key prefix', () => {
		expect(
			isLocalStorageExperimentAssignmentKey(
				localStorageExperimentAssignmentKeyPrefix.slice( 0, -1 )
			)
		).toBe( false );
	} );

	it( 'should return true if key is the same as the experiment assignment key prefix', () => {
		expect(
			isLocalStorageExperimentAssignmentKey( localStorageExperimentAssignmentKeyPrefix )
		).toBe( true );
	} );

	it( 'should return true if key starts with the experiment assignment key prefix', () => {
		expect(
			isLocalStorageExperimentAssignmentKey(
				localStorageExperimentAssignmentKeyPrefix + 'an-experiment'
			)
		).toBe( true );
	} );
} );

describe( 'experimentNameFromLocalStorageExperimentAssignmentKey', () => {
	it( 'should return the experiment name if it begins with the experiment assignment key prefix', () => {
		const experimentName = 'test1';
		const key = `${ localStorageExperimentAssignmentKeyPrefix }-${ experimentName }`;
		expect( experimentNameFromLocalStorageExperimentAssignmentKey( key ) ).toBe( experimentName );
	} );

	it( 'should return an empty string if the key is shorter than the experiment assignment key prefix', () => {
		expect( experimentNameFromLocalStorageExperimentAssignmentKey( 'a' ) ).toBe( '' );

		expect( experimentNameFromLocalStorageExperimentAssignmentKey( '' ) ).toBe( '' );
	} );
} );

describe( 'removeExpiredExperimentAssignments', () => {
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

	it( 'should remove all stored ExperimentAssignments that are invalid', () => {
		const invalidExperimentAssignments = [
			{
				...validExperimentAssignment,
				experimentName: undefined,
			},
			{
				...validFallbackExperimentAssignment,
				experimentName: null,
			},
			{
				...validExperimentAssignment,
				experimentName: 42,
			},
			{
				...validExperimentAssignment,
				variationName: undefined,
			},
			{
				...validFallbackExperimentAssignment,
				variationName: 0,
			},
			{
				...validExperimentAssignment,
				retrievedTimestamp: undefined,
			},
			{
				...validFallbackExperimentAssignment,
				retrievedTimestamp: 'string',
			},
			{
				...validExperimentAssignment,
				ttl: undefined,
			},
			{
				...validExperimentAssignment,
				ttl: 'string',
			},
			{
				...validFallbackExperimentAssignment,
				ttl: 0,
			},
		];

		localStorage.setItem(
			localStorageExperimentAssignmentKey( 'invalid-experiment1' ),
			JSON.stringify( invalidExperimentAssignments[ 0 ] )
		);
		removeExpiredExperimentAssignments();
		expect( localStorage.length ).toBe( 0 );

		invalidExperimentAssignments.map( ( experiment, index ) => {
			localStorage.setItem(
				localStorageExperimentAssignmentKey( `invalid-experiment${ index }` ),
				JSON.stringify( experiment )
			);
		} );
		removeExpiredExperimentAssignments();
		expect( localStorage.length ).toBe( 0 );

		localStorage.clear();
		localStorage.setItem(
			localStorageExperimentAssignmentKey( 'invalid-experiment2' ),
			JSON.stringify( invalidExperimentAssignments[ 1 ] )
		);
		storeExperimentAssignment( validExperimentAssignment );
		removeExpiredExperimentAssignments();
		expect( localStorage.length ).toBe( 1 );
	} );
} );
