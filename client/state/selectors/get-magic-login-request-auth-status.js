/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getMagicLoginRequestAuthStatus( state ) {
	return get( state, 'login.magicLogin.requestAuthSuccess', null );
}
