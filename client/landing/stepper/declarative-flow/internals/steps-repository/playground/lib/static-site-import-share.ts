import { STATIC_SITE_IMPORT_SHARE_KEY_PREFIX } from './constants';

/*
 * Which WordPress.com static site import preview a saved Playground was booted
 * from. The Playground itself lives in the browser (OPFS) under its ID, and can
 * be reopened and launched from another tab days later, so the share token is
 * kept in localStorage under the same ID rather than in the tab's session.
 *
 * Storage can be unavailable (privacy modes, quota); attribution is a courtesy,
 * so every failure here is silent and never affects the Playground.
 */

const keyFor = ( playgroundId: string ) => STATIC_SITE_IMPORT_SHARE_KEY_PREFIX + playgroundId;

/**
 * Record the share token a Playground was booted from, or forget it when it was
 * booted from something else.
 */
export function rememberStaticSiteImportShare( playgroundId: string, shareToken: string | null ) {
	try {
		if ( shareToken ) {
			window.localStorage.setItem( keyFor( playgroundId ), shareToken );
		} else {
			window.localStorage.removeItem( keyFor( playgroundId ) );
		}
	} catch {
		// Unavailable storage only costs the attribution.
	}
}

/**
 * The share token a Playground was booted from, removed as it is read: one
 * preview, one launch.
 */
export function takeStaticSiteImportShare( playgroundId: string ): string | undefined {
	try {
		const shareToken = window.localStorage.getItem( keyFor( playgroundId ) );
		window.localStorage.removeItem( keyFor( playgroundId ) );
		return shareToken ?? undefined;
	} catch {
		return undefined;
	}
}
