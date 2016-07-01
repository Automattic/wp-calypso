import { sitesSchema } from 'state/sites/schema';

// we're based on the normal site endpoint schema, but we want to add in a feed_ID property
export const readerSitesSchema = {
	...sitesSchema,
	patternProperties: {
		...sitesSchema.patternProperties,
		[ '^\\d+$' ]: {
			...sitesSchema.patternProperties[ '^\\d+$' ],
			properties: {
				...sitesSchema.patternProperties[ '^\\d+$' ].properties,
				feed_ID: { type: 'number' }
			}
		}
	}
};
