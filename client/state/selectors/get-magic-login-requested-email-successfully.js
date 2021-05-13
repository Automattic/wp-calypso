/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/login/init';

export default function getMagicLoginRequestedEmailSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestedEmailSuccessfully', false );
}
