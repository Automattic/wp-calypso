/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import availableTimes from './available-times';
import appointments from './appointments';

export default mergeHandlers( availableTimes, appointments );
