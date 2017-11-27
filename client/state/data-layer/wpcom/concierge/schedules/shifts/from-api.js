/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const transformShift = shift => ( {
	id: shift.id,
	beginTimestamp: shift.begin_timestamp,
	endTimestamp: shift.end_timestamp,
} );

export const transform = response => response.map( transformShift );

export default makeParser( responseSchema, {}, transform );
