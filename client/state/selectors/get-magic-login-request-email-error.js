/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMagicLoginRequestEmailError( state ) {
	return get( state, 'login.magicLogin.requestEmailError', null );
}
