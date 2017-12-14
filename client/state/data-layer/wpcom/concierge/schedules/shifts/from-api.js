/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const transformShift = shift => ( {
	// Convert Unix seconds-based timestamps to JS milliseconds-based timestamps
	beginTimestamp: shift.begin_timestamp * 1000,
	endTimestamp: shift.end_timestamp * 1000,
} );

export const transform = response => response.map( transformShift );

export default makeParser( responseSchema, {}, transform );
