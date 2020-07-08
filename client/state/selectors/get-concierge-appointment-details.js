/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/concierge/init';

export default ( state, appointmentId ) =>
	get( state, [ 'concierge', 'appointmentDetails', appointmentId ], null );
