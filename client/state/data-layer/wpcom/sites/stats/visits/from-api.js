/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { parseChartData } from 'calypso/state/stats/lists/utils';
import responseSchema from './schema';

export default makeJsonSchemaParser( responseSchema, parseChartData );
