/**
 * Internal dependencies
 */
import { SESSION_ACTIVE, SESSION_EXPIRED } from './reducer';

export function isSupportSession( { support } ) {
	return support === SESSION_ACTIVE || support === SESSION_EXPIRED;
}
