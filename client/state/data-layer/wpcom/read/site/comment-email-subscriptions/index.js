/** @format */
/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import subscribe from './new';
import unsubscribe from './delete';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/site/comment-email-subscriptions/index.js',
	mergeHandlers( subscribe, unsubscribe )
);

export default {};
