import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import responseSchema from './schema';

export const transform = ( {
	begin_timestamp,
	end_timestamp,
	schedule_id,
	site_id,
	...rest
} ) => ( {
	beginTimestamp: begin_timestamp * 1000,
	endTimestamp: end_timestamp * 1000,
	scheduleId: schedule_id,
	siteId: site_id,
	...rest,
} );

export default makeJsonSchemaParser( responseSchema, transform );
