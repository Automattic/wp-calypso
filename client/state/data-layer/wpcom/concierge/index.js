/**
 * Internal dependencies
 */
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import schedules from './schedules';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/concierge/index.js', mergeHandlers( schedules ) );
