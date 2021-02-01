/**
 * Internal dependencies
 */
import * as Validations from '../validations';
import { validExperimentAssignmentA, validExperimentAssignmentB } from '../test-common';

describe( 'isObject', () => {
	it( 'returns true for an object', () => {
		expect( Validations.isObject( {} ) ).toBe( true );
		expect( Validations.isObject( { key: 'value' } ) ).toBe( true );
		expect( Validations.isObject( new Error( 'foo' ) ) ).toBe( true );
	} );
	it( 'returns false for a non object', () => {
		expect( Validations.isObject( undefined ) ).toBe( false );
		expect( Validations.isObject( null ) ).toBe( false );
		expect( Validations.isObject( 1 ) ).toBe( false );
		expect( Validations.isObject( 'object' ) ).toBe( false );
	} );
} );

describe( 'isName', () => {
	it( 'returns true for a valid name', () => {
		expect( Validations.isName( 'experiment_name' ) ).toBe( true );
		expect( Validations.isName( 'experiment_123_name' ) ).toBe( true );
		expect( Validations.isName( 'experiment_123_123' ) ).toBe( true );
	} );
	it( 'returns false for an invalid name', () => {
		expect( Validations.isName( 'experiment_123_123_' ) ).toBe( false );
		expect( Validations.isName( '_experiment_123_123' ) ).toBe( false );
		expect( Validations.isName( 'a' ) ).toBe( false );
		expect( Validations.isName( 123 ) ).toBe( false );
		expect( Validations.isName( {} ) ).toBe( false );
		expect( Validations.isName( undefined ) ).toBe( false );
		expect( Validations.isName( null ) ).toBe( false );
	} );
} );

describe( 'isExperimentAssignment', () => {
	it( 'returns true for a valid ExperimentAssignment', () => {
		expect( Validations.isExperimentAssignment( validExperimentAssignmentA ) ).toBe( true );
		expect( Validations.isExperimentAssignment( validExperimentAssignmentB ) ).toBe( true );
	} );
	it( 'returns false for an invalid ExperimentAssignment', () => {
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentA,
				experimentName: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				experimentName: null,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				experimentName: 1,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentA,
				variationName: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				variationName: 0,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentA,
				retrievedTimestamp: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				retrievedTimestamp: 'string',
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentA,
				ttl: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				ttl: 'string',
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignmentB,
				ttl: 0,
			} )
		).toBe( false );
	} );
} );

describe( 'validateExperimentAssignment', () => {
	it( 'returns a valid ExperimentAssignment', () => {
		expect( Validations.validateExperimentAssignment( validExperimentAssignmentA ) ).toEqual(
			validExperimentAssignmentA
		);
		expect( Validations.validateExperimentAssignment( validExperimentAssignmentB ) ).toEqual(
			validExperimentAssignmentB
		);
	} );
	it( 'throws if there is an invalid ExperimentAssignment', () => {
		expect( () => {
			Validations.validateExperimentAssignment( {
				...validExperimentAssignmentB,
				experimentName: null,
			} );
		} ).toThrowErrorMatchingInlineSnapshot( `"Invalid ExperimentAssignment"` );
	} );
} );
