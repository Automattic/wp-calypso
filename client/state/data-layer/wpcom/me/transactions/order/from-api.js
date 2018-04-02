/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export default makeParser( responseSchema, {} );
