/** @format */
/**
 * Internal dependencies
 */
import commentEmailSubscriptions from './comment-email-subscriptions';
import postEmailSubscriptions from './post-email-subscriptions';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( commentEmailSubscriptions, postEmailSubscriptions );
