/**
 * Internal dependencies
 */
import { sitesSchema } from 'calypso/state/sites/schema';

// based on the normal site endpoint schema with a few extra properties
export const readerSitesSchema = {
	...sitesSchema,
	patternProperties: {
		...sitesSchema.patternProperties,
		[ '^\\d+$' ]: {
			...sitesSchema.patternProperties[ '^\\d+$' ],
			properties: {
				...sitesSchema.patternProperties[ '^\\d+$' ].properties,
				feed_ID: { type: 'number' },
				subscription: { type: 'object' },
				is_blocked: { type: 'boolean' },
				organization_id: { type: 'number' },
				unseen_count: { type: 'number' },
			},
		},
	},
};
