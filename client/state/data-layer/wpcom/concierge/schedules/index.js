/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import availableTimes from './available-times';
import appointments from './appointments';

export default mergeHandlers( availableTimes, appointments );
