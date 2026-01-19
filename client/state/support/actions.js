import { SUPPORT_SESSION_TRANSITION } from 'calypso/state/action-types';
import { SESSION_ACTIVE } from './constants';

import 'calypso/state/support/init';

export function supportSessionActivate() {
	return {
		type: SUPPORT_SESSION_TRANSITION,
		nextState: SESSION_ACTIVE,
	};
}
