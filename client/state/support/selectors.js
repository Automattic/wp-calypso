import { SESSION_ACTIVE, SESSION_EXPIRED } from './constants';

import 'calypso/state/support/init';

export function isSupportSession( { support } ) {
	return support === SESSION_ACTIVE || support === SESSION_EXPIRED;
}
