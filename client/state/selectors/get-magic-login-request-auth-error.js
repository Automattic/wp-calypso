/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMagicLoginRequestAuthError( state ) {
	return get( state, 'login.magicLogin.requestAuthError', null );
}
