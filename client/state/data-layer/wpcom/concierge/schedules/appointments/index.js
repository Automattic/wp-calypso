/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import bookHandlers from './book';
import cancelHandlers from './cancel';
import detailHandlers from './detail';
import rescheduleHandlers from './reschedule';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/concierge/schedules/appointments/index.js',
	mergeHandlers( bookHandlers, cancelHandlers, detailHandlers, rescheduleHandlers )
);

export default {};
