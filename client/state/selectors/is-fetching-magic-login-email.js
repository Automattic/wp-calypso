/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isFetchingMagicLoginEmail( state ) {
	return get( state, 'login.magicLogin.isFetchingEmail', false );
}
