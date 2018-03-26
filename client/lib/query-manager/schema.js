/** @format */

/**
 * External dependencies
 */
import { cloneDeepWith } from 'lodash';

const queryManagerSchema = Object.freeze( {
	additionalProperties: false,
	required: Object.freeze( [ 'data', 'options' ] ),
	type: 'object',
	properties: Object.freeze( {
		data: Object.freeze( {
			additionalProperties: false,
			type: 'object',
			properties: Object.freeze( {
				items: Object.freeze( { type: 'object' } ),
				queries: Object.freeze( {
					additionalProperties: false,
					type: 'object',
					patternProperties: Object.freeze( {
						// Stringified query objects are the keys
						'^\\[.*\\]$': Object.freeze( {
							required: Object.freeze( [ 'itemKeys' ] ),
							type: 'object',
							properties: Object.freeze( {
								itemKeys: Object.freeze( {
									type: 'array',
									items: Object.freeze( { type: Object.freeze( [ 'string', 'integer' ] ) } ),
								} ),
								found: Object.freeze( {
									type: 'integer',
								} ),
							} ),
						} ),
					} ),
				} ),
			} ),
		} ),
		options: Object.freeze( {
			additionalProperties: true,
			required: Object.freeze( [ 'itemKey' ] ),
			type: 'object',
			properties: Object.freeze( {
				itemKey: Object.freeze( { type: 'string' } ),
			} ),
		} ),
	} ),
} );

/**
 * Get a queryManagerSchema with a customized items schema
 *
 * @param  {Object} itemsSchema Schema that will be used for the items
 * @return {Object}            Customized schema
 */
export function withItemsSchema( itemsSchema ) {
	return cloneDeepWith( queryManagerSchema, value => {
		if ( value === queryManagerSchema.properties.data.properties.items ) {
			return itemsSchema;
		}
	} );
}

export default queryManagerSchema;
