import { __ } from '@wordpress/i18n';
import type { JetpackRecoverySessionError, Site } from '@automattic/api-core';

const FIFTEEN_MINUTES = 15 * 60;

function getJetpackCriticalErrorState(
	site: Site,
	now: number = Math.floor( Date.now() / 1000 )
): 'in-recovery' | 'critical-error' | null {
	const status = site.options?.jetpack_recovery_mode_status;
	if ( ! status ) {
		return null;
	}

	const enteredAt = status.recovery_session_entered_at ?? 0;
	const exitedAt = status.recovery_session_exited_at ?? 0;
	const lastSent = status.recovery_mode_email_last_sent ?? 0;

	if ( enteredAt > 0 && enteredAt > exitedAt ) {
		return 'in-recovery';
	}

	// Suppress for 15 min after a clean exit so a just-resolved error doesn't linger.
	if ( exitedAt >= lastSent && now - exitedAt < FIFTEEN_MINUTES ) {
		return null;
	}

	if ( lastSent > 0 && enteredAt < lastSent ) {
		return 'critical-error';
	}

	return null;
}

export function hasJetpackCriticalError( site: Site ): boolean {
	return getJetpackCriticalErrorState( site ) !== null;
}

// Criteria for being redirected to /critical-error.
export function isInJetpackCriticalErrorState( site: Site ): boolean {
	return !! site.__inaccessible_jetpack_error && hasJetpackCriticalError( site );
}

export function getJetpackRecoverySessionErrors( site: Site ): JetpackRecoverySessionError[] {
	return site.options?.jetpack_recovery_mode_status?.recovery_session_errors ?? [];
}

export function getJetpackCriticalErrorMessage( site: Site ): string | null {
	if ( ! hasJetpackCriticalError( site ) ) {
		return null;
	}

	const isAdmin = !! site.capabilities?.manage_options;
	return isAdmin
		? __(
				'There has been a critical error on this website. Here is what we know and what you can do next.'
		  )
		: __( 'There has been a critical error on this site. A site administrator has been notified.' );
}
