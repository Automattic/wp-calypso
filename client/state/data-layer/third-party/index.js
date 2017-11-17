/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import refer from './refer';
import directly from './directly';

export const handlers = mergeHandlers( directly, refer );

export default handlers;
