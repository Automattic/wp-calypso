/** @format */

/**
 * Internal dependencies
 */
import responseSchema from './schema';
import { makeParser } from 'lib/make-json-schema-parser';

export default makeParser( responseSchema, {} );
