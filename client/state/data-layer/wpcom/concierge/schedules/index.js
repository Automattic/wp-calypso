/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import appointments from './appointments';
import initial from './initial';

export default mergeHandlers( appointments, initial );
