/**
 * Internal dependencies
 */
import * as Validations from '../validations';
import { validExperimentAssignment, validFallbackExperimentAssignment } from '../test-common';

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
		expect( Validations.isExperimentAssignment( validExperimentAssignment ) ).toBe( true );
		expect( Validations.isExperimentAssignment( validFallbackExperimentAssignment ) ).toBe( true );
	} );
	it( 'returns false for an invalid ExperimentAssignment', () => {
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignment,
				experimentName: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				experimentName: null,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				experimentName: 1,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignment,
				variationName: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				variationName: 0,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignment,
				retrievedTimestamp: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				retrievedTimestamp: 'string',
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validExperimentAssignment,
				ttl: undefined,
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				ttl: 'string',
			} )
		).toBe( false );
		expect(
			Validations.isExperimentAssignment( {
				...validFallbackExperimentAssignment,
				ttl: 0,
			} )
		).toBe( false );
	} );
} );

describe( 'validateExperimentAssignment', () => {
	it( 'returns a valid ExperimentAssignment', () => {
		expect( Validations.validateExperimentAssignment( validExperimentAssignment ) ).toEqual(
			validExperimentAssignment
		);
		expect( Validations.validateExperimentAssignment( validFallbackExperimentAssignment ) ).toEqual(
			validFallbackExperimentAssignment
		);
	} );
	it( 'throws if there is an invalid ExperimentAssignment', () => {
		expect( () => {
			Validations.validateExperimentAssignment( {
				...validFallbackExperimentAssignment,
				experimentName: null,
			} );
		} ).toThrowErrorMatchingInlineSnapshot( `"Invalid ExperimentAssignment"` );
	} );
} );
