/**
 * Dev/QA overrides for the account-recovery interstitial, driven by the
 * `?account-recovery-interstitial=<value>` query param (the feature flag must still be on):
 *
 * - `force` — show the modal with the user's real setup state, bypassing eligibility.
 * - a variant name (`none`, `add-two-factor`, `add-recovery-method`, `add-backup-codes`,
 *   `strong`) — show the modal with a *simulated* setup state, so the heading, copy, masked
 *   details, snooze window, and Tracks all derive from it exactly as a real user in that state
 *   would see.
 *
 * Either value force-shows the modal, bypassing eligibility (and therefore any real snooze).
 * With no param — the normal path — `applyQaOverrides` returns the real state untouched.
 */
import { RECOVERY_INTERSTITIAL_QA_PARAM } from './constants';
import type { InterstitialVariant } from './copy';

export interface InterstitialSetupState {
	hasRecoveryEmail: boolean;
	hasRecoveryPhone: boolean;
	hasTwoFactor: boolean;
	hasBackupCodes: boolean;
	/** Validated recovery email/phone, for personalizing the `strong` copy. */
	recoveryEmail?: string;
	recoveryPhoneNumber?: string;
}

/** Simulated setup state per variant name. Sample recovery details mirror the `has*` flags. */
const QA_SCENARIOS: Record< InterstitialVariant, InterstitialSetupState > = {
	none: {
		hasRecoveryEmail: false,
		hasRecoveryPhone: false,
		hasTwoFactor: false,
		hasBackupCodes: false,
	},
	'add-two-factor': {
		hasRecoveryEmail: true,
		hasRecoveryPhone: false,
		hasTwoFactor: false,
		hasBackupCodes: false,
		recoveryEmail: 'qa@example.com',
	},
	'add-recovery-method': {
		hasRecoveryEmail: false,
		hasRecoveryPhone: false,
		hasTwoFactor: true,
		hasBackupCodes: false,
	},
	'add-backup-codes': {
		hasRecoveryEmail: true,
		hasRecoveryPhone: true,
		hasTwoFactor: true,
		hasBackupCodes: false,
		recoveryEmail: 'qa@example.com',
		recoveryPhoneNumber: '5551234542',
	},
	strong: {
		hasRecoveryEmail: true,
		hasRecoveryPhone: true,
		hasTwoFactor: true,
		hasBackupCodes: true,
		recoveryEmail: 'qa@example.com',
		recoveryPhoneNumber: '5551234542',
	},
};

function getQaParam(): string | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( RECOVERY_INTERSTITIAL_QA_PARAM );
}

/**
 * Overlays any QA override on the user's real setup state, returning the state to render and
 * whether the modal should be force-shown (bypassing eligibility). No param → real state,
 * `isForced: false`.
 */
export function applyQaOverrides( realSetupState: InterstitialSetupState ): {
	setupState: InterstitialSetupState;
	isForced: boolean;
} {
	const param = getQaParam();
	if ( param === 'force' ) {
		return { setupState: realSetupState, isForced: true };
	}
	if ( param && param in QA_SCENARIOS ) {
		return { setupState: QA_SCENARIOS[ param as InterstitialVariant ], isForced: true };
	}
	return { setupState: realSetupState, isForced: false };
}
