/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import subscriptionsNew from './new';
import subscriptionsDelete from './delete';

export default mergeHandlers( subscriptionsNew, subscriptionsDelete );
