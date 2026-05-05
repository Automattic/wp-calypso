/**
 * Helpers for reading the Jetpack Social script-data blob that Jetpack injects
 * on pages where Jetpack Social is loaded.
 *
 * Image Studio runs in its own bundle and intentionally avoids importing from
 * `@automattic/jetpack-script-data`. Encapsulating the window reads here keeps
 * the global dependency in one place and lets callers branch on `null` cleanly.
 */

type JetpackSocialScriptData = {
	api_paths?: { resharePost?: unknown };
	urls?: { connectionsManagementPage?: unknown };
};

function getSocialScriptData(): JetpackSocialScriptData | undefined {
	return (
		window as unknown as {
			JetpackScriptData?: { social?: JetpackSocialScriptData };
		}
	 ).JetpackScriptData?.social;
}

function readNonEmptyString( value: unknown ): string | null {
	return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Read the Jetpack Social "reshare post" REST path.
 * @returns The path template (e.g. `/wpcom/v2/publicize/share-post/{postId}`)
 *          or `null` if Jetpack Social isn't available on this page.
 */
export function getReelSharePostPath(): string | null {
	return readNonEmptyString( getSocialScriptData()?.api_paths?.resharePost );
}

/**
 * Read the Jetpack Social "connections management page" URL — a full,
 * site-resolved URL pointing at the marketing connections screen for the
 * current site (e.g. `https://wordpress.com/marketing/connections/example.wordpress.com`).
 * @returns The full URL or `null` if Jetpack Social isn't available on this page.
 */
export function getConnectionsManagementUrl(): string | null {
	return readNonEmptyString( getSocialScriptData()?.urls?.connectionsManagementPage );
}
