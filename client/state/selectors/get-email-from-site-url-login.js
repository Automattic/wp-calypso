import { get } from 'lodash';

import 'calypso/state/login/init';

export default function getEmailFromLoginBySiteUrl( state ) {
	return get( state, 'login.magicLogin.censoredEmailAddress', false );
}
