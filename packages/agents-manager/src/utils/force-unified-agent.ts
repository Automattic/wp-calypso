const FORCE_PARAM = 'force-unified-agent';
const STORAGE_KEY = 'agents-manager-force-unified-agent';

/**
 * Local development hosts, mirroring `is_dev_mode()` in Jetpack's
 * `class-agents-manager.php`. The override is confined to these so it can
 * never change eligibility on wordpress.com.
 */
function isLocalDevHost(): boolean {
	const { hostname } = window.location;

	return (
		hostname === 'localhost' ||
		hostname.endsWith( '.localhost' ) ||
		hostname.endsWith( '.jurassic.tube' ) ||
		hostname.endsWith( '.jurassic.ninja' )
	);
}

/**
 * Whether `?force-unified-agent=1` should stand in for the server's
 * `unified_ai_chat` eligibility check.
 *
 * The real flag is an account opt-in resolved server-side, which makes the
 * unified sidebar unreachable in local Calypso for anyone not opted in — even
 * when the work is purely front-end. This override covers that case only: it
 * decides whether the sidebar *mounts*, never what the agent backend will
 * actually serve.
 *
 * Sticky for the session, so navigating within Calypso doesn't drop it when
 * the param falls off the URL. Pass `?force-unified-agent=0` to clear it.
 */
export function hasForcedUnifiedAgent(): boolean {
	if ( typeof window === 'undefined' || ! isLocalDevHost() ) {
		return false;
	}

	const param = new URLSearchParams( window.location.search ).get( FORCE_PARAM );

	try {
		if ( param === '1' ) {
			window.sessionStorage.setItem( STORAGE_KEY, '1' );
			return true;
		}
		if ( param === '0' ) {
			window.sessionStorage.removeItem( STORAGE_KEY );
			return false;
		}

		return window.sessionStorage.getItem( STORAGE_KEY ) === '1';
	} catch {
		// Private-mode storage failures shouldn't break the check.
		return param === '1';
	}
}
