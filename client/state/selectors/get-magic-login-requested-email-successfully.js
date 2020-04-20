/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function getMagicLoginRequestedEmailSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestedEmailSuccessfully', false );
}
