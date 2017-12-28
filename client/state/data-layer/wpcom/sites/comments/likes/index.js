/** @format */

/**
 * Internal dependencies
 */

import mine from './mine';
import newLike from './new';
import { mergeHandlers } from 'client/state/action-watchers/utils';

export default mergeHandlers( mine, newLike );
