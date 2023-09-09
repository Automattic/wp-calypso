import { get } from 'lodash';

import 'calypso/state/login/init';

export default function isMagicLoginEmailRequested( state ) {
	return get( state, 'login.magicLogin.requestEmailSuccess', false );
}
