/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMagicLoginRequestedAuthSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestAuthSuccess', false );
}
