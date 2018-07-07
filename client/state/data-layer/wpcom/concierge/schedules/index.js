/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import availableTimes from './available-times';
import appointments from './appointments';
import initial from './initial';

export default mergeHandlers( availableTimes, appointments, initial );
