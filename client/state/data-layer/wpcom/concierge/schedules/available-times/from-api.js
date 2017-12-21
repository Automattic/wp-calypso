/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const convertToDate = timestampInSeconds => timestampInSeconds * 1000;

export const transform = response => response.map( convertToDate );

export default makeParser( responseSchema, {}, transform );
