/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import { parseChartData } from 'state/stats/lists/utils';
import responseSchema from './schema';

export default makeJsonSchemaParser( responseSchema, parseChartData );
