import { get } from 'lodash';

import 'calypso/state/concierge/init';

export default ( state ) => get( state, 'concierge.isUserBlocked', null );
