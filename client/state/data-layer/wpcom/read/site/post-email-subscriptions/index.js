/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import subscribe from './new';
import update from './update';
import unsubscribe from './delete';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/site/post-email-subscriptions/index.js',
	mergeHandlers( subscribe, update, unsubscribe )
);

export default {};
