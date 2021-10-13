import { get } from 'lodash';

import 'calypso/state/login/init';

export default function isFetchingMagicLoginEmail( state ) {
	return get( state, 'login.magicLogin.isFetchingEmail', false );
}
