/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const transform = ( { begin_timestamp, end_timestamp, schedule_id, ...rest } ) => ( {
	beginTimestamp: begin_timestamp,
	endTimestamp: end_timestamp,
	scheduleId: schedule_id,
	...rest,
} );

export default makeParser( responseSchema, {}, transform );
