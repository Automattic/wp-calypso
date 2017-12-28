/** @format */

/**
 * External dependencies
 */

import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserData } from 'client/state/selectors';

export default state => {
	const { user, firstname, lastname, url } = getAccountRecoveryResetUserData( state );

	return isString( user ) || [ firstname, lastname, url ].every( isString );
};
