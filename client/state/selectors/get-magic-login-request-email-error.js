/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function getMagicLoginRequestEmailError( state ) {
	return get( state, 'login.magicLogin.requestEmailError', null );
}
