/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { cloneDeepWith } from 'lodash';

// Do not export this object without ensuring it cannot be mutated
const queryManagerSchema = {
	additionalProperties: false,
	required: [ 'data', 'options' ],
	type: 'object',
	properties: {
		data: {
			additionalProperties: false,
			type: 'object',
			properties: {
				items: { type: 'object' },
				queries: {
					additionalProperties: false,
					type: 'object',
					patternProperties: {
						// Stringified query objects are the keys
						'^\\[.*\\]$': {
							required: [ 'itemKeys' ],
							type: 'object',
							properties: {
								itemKeys: {
									type: 'array',
									items: { type: 'string' },
								},
								found: {
									type: 'integer',
								},
							},
						},
					},
				},
			},
		},
		options: {
			additionalProperties: true,
			required: [ 'itemKey' ],
			type: 'object',
			properties: {
				itemKey: { type: 'string' },
			},
		},
	},
};

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

export default deepFreeze( queryManagerSchema );
