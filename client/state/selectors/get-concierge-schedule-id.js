/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/concierge/init';

export default ( state ) => get( state, 'concierge.scheduleId', null );
