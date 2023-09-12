import { get } from 'lodash';

import 'calypso/state/login/init';

export default function getMagicLoginIsFetchingEmail( state ) {
	return get( state, 'login.magicLogin.isFetchingEmail', false );
}
