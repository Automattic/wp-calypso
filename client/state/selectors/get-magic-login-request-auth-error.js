import { get } from 'lodash';

import 'calypso/state/login/init';

export default function getMagicLoginRequestAuthError( state ) {
	return get( state, 'login.magicLogin.requestAuthError', null );
}
