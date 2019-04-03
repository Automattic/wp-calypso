/** @format */

/**
 * Internal dependencies
 */

import { SUPPORT_SESSION_TRANSITION } from 'state/action-types';
import { SESSION_ACTIVE, SESSION_EXPIRED } from './reducer';

export function supportSessionActivate() {
	return {
		type: SUPPORT_SESSION_TRANSITION,
		nextState: SESSION_ACTIVE,
	};
}

export function supportSessionExpire() {
	return {
		type: SUPPORT_SESSION_TRANSITION,
		nextState: SESSION_EXPIRED,
	};
}
