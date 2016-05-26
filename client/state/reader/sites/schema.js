import { sitesSchema } from 'state/sites/schema';

export const readerSitesSchema = Object.assign( {}, sitesSchema );

readerSitesSchema.patternProperties['^\\d+$'].properties.feed_ID = { type: 'number' };
