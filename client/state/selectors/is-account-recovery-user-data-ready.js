/** @format */

/**
 * External dependencies
 */

import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import getAccountRecoveryResetUserData from 'state/selectors/get-account-recovery-reset-user-data';

export default state => {
	const { user, firstname, lastname, url } = getAccountRecoveryResetUserData( state );

	return isString( user ) || [ firstname, lastname, url ].every( isString );
};
