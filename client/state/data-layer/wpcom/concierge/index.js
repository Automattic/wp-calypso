import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import schedules from './schedules';

registerHandlers( 'state/data-layer/wpcom/concierge/index.js', mergeHandlers( schedules ) );
