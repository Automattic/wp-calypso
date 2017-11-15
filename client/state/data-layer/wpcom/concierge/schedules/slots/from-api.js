/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const transformSlot = slot => ( {
	beginTimestamp: slot.begin_timestamp,
	endTimestamp: slot.end_timestamp,
	scheduleId: slot.schedule_id,
	description: slot.description,
} );

export const transform = response => response.map( transformSlot );

export default makeParser( responseSchema, {}, transform );
