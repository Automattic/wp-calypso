/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( state, appointmentId ) =>
	get( state, [ 'concierge', 'appointmentDetails', appointmentId ], null );
