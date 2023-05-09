import { get } from 'lodash';

import 'calypso/state/login/init';

export default function getMagicLoginRequestedAuthSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestAuthSuccess', false );
}
