/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import postEmailSubscriptions from './post-email-subscriptions';
import commentEmailSubscriptions from './comment-email-subscriptions';

export default mergeHandlers(
	commentEmailSubscriptions,
	postEmailSubscriptions,
);
