import { get } from 'lodash';

import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsTestStatus( state, siteId, role ) {
	return get( state, [ 'jetpack', 'credentials', 'testRequestStatus', siteId, role ], 'pending' );
}
