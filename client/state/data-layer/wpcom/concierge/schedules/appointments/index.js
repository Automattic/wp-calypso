/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import bookHandlers from './book';
import cancelHandlers from './cancel';
import detailHandlers from './detail';
import rescheduleHandlers from './reschedule';

export default mergeHandlers( bookHandlers, cancelHandlers, detailHandlers, rescheduleHandlers );
