/** @format */

/**
 * Internal dependencies
 */
import queryManagerSchema, { withItemsSchema } from '../schema';

describe( 'withItemsSchema', () => {
	it( 'should return a new schema', () => {
		expect( withItemsSchema( {} ) ).not.toBe( queryManagerSchema );
	} );

	it( 'should inject item schema', () => {
		const itemSchema = { title: 'Test item schema' };
		expect( withItemsSchema( itemSchema ) ).toHaveProperty(
			'properties.data.properties.items',
			itemSchema
		);
	} );
} );
