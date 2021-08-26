import { get } from 'lodash';

import 'calypso/state/login/init';

export default function getMagicLoginRequestedEmailSuccessfully( state ) {
	return get( state, 'login.magicLogin.requestedEmailSuccessfully', false );
}
