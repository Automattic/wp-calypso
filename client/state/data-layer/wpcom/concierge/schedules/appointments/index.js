import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import bookHandlers from './book';
import cancelHandlers from './cancel';
import detailHandlers from './detail';
import rescheduleHandlers from './reschedule';

registerHandlers(
	'state/data-layer/wpcom/concierge/schedules/appointments/index.js',
	mergeHandlers( bookHandlers, cancelHandlers, detailHandlers, rescheduleHandlers )
);

export default {};
