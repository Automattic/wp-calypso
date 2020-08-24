/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function getMagicLoginRequestAuthError( state ) {
	return get( state, 'login.magicLogin.requestAuthError', null );
}
