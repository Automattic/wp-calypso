/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

export default function getMagicLoginCurrentView( state ) {
	return get( state, 'login.magicLogin.currentView', null );
}
