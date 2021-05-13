/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/concierge/init';

export default ( state, appointmentId ) =>
	get( state, [ 'concierge', 'appointmentDetails', appointmentId ], null );
