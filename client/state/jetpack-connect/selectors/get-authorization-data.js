import { get } from 'lodash';

import 'calypso/state/jetpack-connect/init';

export const getAuthorizationData = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};
