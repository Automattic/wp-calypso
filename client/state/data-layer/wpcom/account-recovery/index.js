/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import requestReset from './request-reset';
import reset from './reset';
import validate from './validate';

export default mergeHandlers(
	requestReset,
	reset,
	validate,
);
