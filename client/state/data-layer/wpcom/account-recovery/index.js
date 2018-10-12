/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import lookup from './lookup';
import requestReset from './request-reset';
import reset from './reset';
import validate from './validate';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/account-recovery/index.js',
	mergeHandlers( lookup, requestReset, reset, validate )
);
