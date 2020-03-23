/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMagicLoginCurrentView( state ) {
	return get( state, 'login.magicLogin.currentView', null );
}
