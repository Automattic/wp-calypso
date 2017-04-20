/**
 * External dependencies
 */
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserData } from './';

export default ( state ) => {
	const {
		user,
		firstName,
		lastName,
		url,
	} = getAccountRecoveryResetUserData( state );

	return isString( user ) || [ firstName, lastName, url ].every( isString );
};
