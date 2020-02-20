/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import responseSchema from './schema';

export default makeJsonSchemaParser( responseSchema );
