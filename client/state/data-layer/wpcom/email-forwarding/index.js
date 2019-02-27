/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import create from './create';
import get from './get';
import remove from './remove';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/email-forwarding/index.js',
	mergeHandlers( get, create, remove )
);
