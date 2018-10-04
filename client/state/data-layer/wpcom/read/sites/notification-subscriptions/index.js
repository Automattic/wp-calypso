/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import subscriptionsNew from './new';
import subscriptionsDelete from './delete';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/sites/notification-subscriptions/index.js',
	mergeHandlers( subscriptionsNew, subscriptionsDelete )
);

export default {};
