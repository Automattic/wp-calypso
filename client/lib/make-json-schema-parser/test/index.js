/**
 * Internal dependencies
 */
import makeJsonSchemaParser from '..';

describe( 'makeJsonSchemaParser', () => {
	test( 'should return a function', () => {
		expect( () => makeJsonSchemaParser( {} )() ).not.toThrow();
	} );

	test( 'should throw SchemaError on if data does not validate', () => {
		const parser = makeJsonSchemaParser( { type: 'null' } );
		expect( () => parser( 0 ) ).toThrow( Error, 'Failed to validate with JSON schema' );
	} );

	test( 'should throw TransformerError if error occurs during transformation', () => {
		const transformer = () => {
			throw Error( 'Testing error during transform' );
		};
		const parser = makeJsonSchemaParser( {}, transformer );
		expect( () => parser( 0 ) ).toThrow( Error, 'Testing error during transform' );
	} );

	test( 'should return input unchanged if valid and no transformer supplied', () => {
		const parser = makeJsonSchemaParser( { type: 'integer' } );
		expect( parser( 0 ) ).toBe( 0 );
	} );

	test( 'should return the result of transformation', () => {
		const transformer = ( a ) => a + 1;
		const parser = makeJsonSchemaParser( { type: 'integer' }, transformer );
		expect( parser( 0 ) ).toBe( 1 );
	} );

	test( 'should validate with additional fields', () => {
		const schema = {
			type: 'object',
			properties: {
				include: { type: 'string' },
			},
		};
		const parser = makeJsonSchemaParser( schema );
		expect( () =>
			parser( {
				include: 'include',
				exclude: 'exclude',
			} )
		).not.toThrow();
	} );

	test( 'should filter additional fields', () => {
		const schema = {
			type: 'object',
			properties: {
				include: { type: 'string' },
			},
		};
		const parser = makeJsonSchemaParser( schema );
		expect(
			parser( {
				include: 'include',
				exclude: 'exclude',
			} )
		).toEqual( { include: 'include' } );
	} );
} );
