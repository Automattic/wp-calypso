import { isSupportSession, isSupportSessionProxy } from '@automattic/calypso-support-session';

/**
 * Whether a Happiness Engineer is currently working inside the user's account:
 * a support session (support-user impersonation or "support next") or a
 * support-session-proxy view.
 *
 * Surveys must never appear in any of them — they interrupt the session and
 * record answers that the account holder never gave, skewing the results.
 *
 * Both signals originate in the SSR'd document, which covers every surface this
 * package runs on (Calypso and the Dashboard). The wp-admin Survicate loader is
 * a separate integration in the Jetpack monorepo and needs its own guard.
 */
export function isInSupportSession(): boolean {
	// `isSupportSession()` is typed `string | boolean` — it returns the stored
	// support-user token rather than a coerced flag.
	return !! isSupportSession() || isSupportSessionProxy();
}
