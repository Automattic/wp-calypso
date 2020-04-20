/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/jetpack-connect/init';

export const getAuthorizationData = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};
