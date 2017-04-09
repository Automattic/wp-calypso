/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import lookup from './lookup';
import requestReset from './request-reset';
import reset from './reset';
import validate from './validate';

export default mergeHandlers(
	lookup,
	requestReset,
	reset,
	validate,
);
