import { get } from 'lodash';

import 'calypso/state/jetpack-connect/init';

export const getConnectingSite = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};
