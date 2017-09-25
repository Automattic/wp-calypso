/**
 * Internal dependencies
 */
import lookup from './lookup';
import requestReset from './request-reset';
import reset from './reset';
import validate from './validate';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	lookup,
	requestReset,
	reset,
	validate,
);
