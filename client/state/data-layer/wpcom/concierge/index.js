/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import schedules from './schedules';

export default mergeHandlers( schedules );
