/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function getMagicLoginRequestedAuthSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestAuthSuccess', false );
}
