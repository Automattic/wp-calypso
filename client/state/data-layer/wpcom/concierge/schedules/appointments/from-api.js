/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'client/state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export default makeParser( responseSchema, {} );
