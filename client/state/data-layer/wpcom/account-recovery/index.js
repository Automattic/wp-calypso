/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import requestReset from './request-reset';

export default mergeHandlers(
	requestReset,
);
