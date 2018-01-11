/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import notificationSubscriptions from './notification-subscriptions';
import posts from './posts';

export default mergeHandlers( notificationSubscriptions, posts );
