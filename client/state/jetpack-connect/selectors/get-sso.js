import { get } from 'lodash';

import 'calypso/state/jetpack-connect/init';

export const getSSO = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackSSO' ] );
};
