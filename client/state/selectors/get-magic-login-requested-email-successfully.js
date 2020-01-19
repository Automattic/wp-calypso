/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMagicLoginRequestedEmailSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestedEmailSuccessfully', false );
}
