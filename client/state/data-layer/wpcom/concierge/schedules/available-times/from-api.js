/** @format */

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import responseSchema from './schema';

export const convertToDate = timestampInSeconds => timestampInSeconds * 1000;

export const transform = response => response.map( convertToDate );

export default makeJsonSchemaParser( responseSchema, transform );
