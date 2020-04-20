/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function isFetchingMagicLoginAuth( state ) {
	return get( state, 'login.magicLogin.isFetchingAuth', false );
}
