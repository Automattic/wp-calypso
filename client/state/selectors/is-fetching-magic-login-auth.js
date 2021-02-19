/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/login/init';

export default function isFetchingMagicLoginAuth( state ) {
	return get( state, 'login.magicLogin.isFetchingAuth', false );
}
