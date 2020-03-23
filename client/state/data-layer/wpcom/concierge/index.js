/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import schedules from './schedules';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/concierge/index.js', mergeHandlers( schedules ) );
