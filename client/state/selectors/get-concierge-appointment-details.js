import { get } from 'lodash';

import 'calypso/state/concierge/init';

export default ( state, appointmentId ) =>
	get( state, [ 'concierge', 'appointmentDetails', appointmentId ], null );
