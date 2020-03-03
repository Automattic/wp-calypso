/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isFetchingMagicLoginAuth( state ) {
	return get( state, 'login.magicLogin.isFetchingAuth', false );
}
