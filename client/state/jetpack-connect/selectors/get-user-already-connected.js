import { get } from 'lodash';
import { getAuthorizationData } from 'calypso/state/jetpack-connect/selectors/get-authorization-data';

import 'calypso/state/jetpack-connect/init';

/**
 * Returns true if the user is already connected, otherwise false
 *
 * @param  {Object}  state Global state tree
 * @returns {boolean}       True if the user is connected otherwise false
 */
export const getUserAlreadyConnected = ( state ) => {
	return get( getAuthorizationData( state ), 'userAlreadyConnected', false );
};
