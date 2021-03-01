/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { cloneDeepWith } from 'lodash';

const queryManagerSchema = deepFreeze( {
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
									items: {
										// Typical valid object keys
										// `null` is important for PagingQueryManager
										// It fills array with undefined (matches null)
										type: [ 'integer', 'null', 'string' ],
									},
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
} );

/**
 * Get a queryManagerSchema with a customized items schema
 *
 * @param  {object} itemsSchema Schema that will be used for the items
 * @returns {object}            Customized schema
 */
export function withItemsSchema( itemsSchema ) {
	return cloneDeepWith( queryManagerSchema, ( value ) => {
		if ( value === queryManagerSchema.properties.data.properties.items ) {
			return itemsSchema;
		}
	} );
}

export default queryManagerSchema;
