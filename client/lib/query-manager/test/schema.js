/**
 * Internal dependencies
 */
import queryManagerSchema, { withItemsSchema } from '../schema';

describe( 'queryManagerSchema', () => {
	test( 'should throw error when attempting to mutate', () => {
		expect(
			() => ( queryManagerSchema.properties.data.properties.items = { type: 'null' } )
		).toThrow( TypeError );
	} );
} );

describe( 'withItemsSchema', () => {
	test( 'should return a new schema', () => {
		expect( withItemsSchema( {} ) ).not.toBe( queryManagerSchema );
	} );

	test( 'should inject item schema', () => {
		const itemSchema = { title: 'Test item schema' };
		expect( withItemsSchema( itemSchema ) ).toHaveProperty(
			'properties.data.properties.items',
			itemSchema
		);
	} );
} );
