/** @format */

/**
 * Internal dependencies
 */
import responseSchema from './schema';
import { makeParser } from 'lib/make-json-schema-parser';

export const convertToDate = timestampInSeconds => timestampInSeconds * 1000;

export const transform = response => response.map( convertToDate );

export default makeParser( responseSchema, {}, transform );
