/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import dataRequest from './data-request';

export default mergeHandlers(
	dataRequest,
);
