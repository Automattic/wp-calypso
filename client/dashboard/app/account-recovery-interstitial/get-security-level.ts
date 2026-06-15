/**
 * Maps the user's account-recovery setup to a coarse security tier.
 */
import type { SecurityLevel } from './constants';

export function getSecurityLevel(
	hasRecoveryEmail: boolean,
	hasRecoveryPhone: boolean,
	hasTwoFactor: boolean
): SecurityLevel {
	const hasRecoveryMethod = hasRecoveryEmail || hasRecoveryPhone;

	if ( ! hasRecoveryMethod && ! hasTwoFactor ) {
		return 'none';
	}

	if ( hasRecoveryMethod && hasTwoFactor ) {
		return 'strong';
	}

	return 'partial';
}
