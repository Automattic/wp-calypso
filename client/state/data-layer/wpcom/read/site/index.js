/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import postEmailSubscriptions from './post-email-subscriptions';
import commentEmailSubscriptions from './comment-email-subscriptions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/site/index.js',
	mergeHandlers( commentEmailSubscriptions, postEmailSubscriptions )
);

export default {};
