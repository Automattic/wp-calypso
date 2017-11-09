/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependenceis
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

const transformShift = shift => ( {
	beginTimestamp: get( shift, 'begin_timestamp' ),
	endTimestamp: get( shift, 'end_timestamp' ),
	scheduleId: get( shift, 'schedule_id' ),
	description: get( shift, 'description' ),
} );

export const transform = response => response.map( transformShift );

export default makeParser( responseSchema, {}, transform );
