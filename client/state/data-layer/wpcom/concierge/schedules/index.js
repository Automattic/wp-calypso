import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import appointments from './appointments';

registerHandlers(
	'state/data-layer/wpcom/concierge/schedules/index.js',
	mergeHandlers( appointments )
);

export default {};
