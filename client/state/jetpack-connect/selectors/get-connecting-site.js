/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/jetpack-connect/init';

export const getConnectingSite = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};
