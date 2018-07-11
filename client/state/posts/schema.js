/** @format */

/**
 * Internal dependencies
 */
import queryManagerSchema from 'lib/query-manager/schema';

export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^\\w+$': {
			type: 'array',
			items: {
				type: 'number',
			},
			minItems: 2,
			maxItems: 2,
		},
	},
	additionalProperties: false,
};

export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': queryManagerSchema,
	},
	additionalProperties: false,
};

export { queryManagerSchema as allSitesQueriesSchema };
