/** @format */

/**
 * Internal dependenceis
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

const transformShift = shift => ( {
	beginTimestamp: shift.begin_timestamp,
	endTimestamp: shift.end_timestamp,
	scheduleId: shift.schedule_id,
	description: shift.description,
} );

export const transform = response => response.map( transformShift );

export default makeParser( responseSchema, {}, transform );
