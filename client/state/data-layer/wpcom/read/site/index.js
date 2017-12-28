/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import postEmailSubscriptions from './post-email-subscriptions';
import commentEmailSubscriptions from './comment-email-subscriptions';

export default mergeHandlers( commentEmailSubscriptions, postEmailSubscriptions );
