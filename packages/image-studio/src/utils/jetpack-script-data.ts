/**
 * Helpers for reading the Jetpack script-data blob that Jetpack injects on
 * pages where Jetpack (and Jetpack Social) are loaded.
 *
 * Image Studio runs in its own bundle and intentionally avoids importing from
 * `@automattic/jetpack-script-data`. Encapsulating the window reads here keeps
 * the global dependency in one place and lets callers branch on `null` cleanly.
 *
 * UPSTREAM CONTRACT — keep in sync with Jetpack:
 *   - `site.admin_url` is set by `JetpackScriptData_Base::get_site_data()`
 *     (jetpack/projects/js-packages/script-data/src/types.ts → SiteData).
 *   - `social.api_paths.resharePost` is set by
 *     `Publicize_Script_Data::get_api_paths()` in
 *     jetpack/projects/packages/publicize/src/class-publicize-script-data.php.
 * If those fields are renamed or moved, the smoke test in
 * jetpack-script-data.test.ts ("structure smoke test") should fail and tell
 * the maintainer where to look.
 */

type JetpackScriptData = {
	site?: { admin_url?: unknown };
	social?: { api_paths?: { resharePost?: unknown } };
};

function getJetpackScriptData(): JetpackScriptData | undefined {
	return ( window as unknown as { JetpackScriptData?: JetpackScriptData } ).JetpackScriptData;
}

/**
 * Read the Jetpack Social "reshare post" REST path.
 * @returns The path template (e.g. `/wpcom/v2/publicize/share-post/{postId}`)
 *          or `null` if Jetpack Social isn't available on this page.
 */
export function getReelSharePostPath(): string | null {
	const path = getJetpackScriptData()?.social?.api_paths?.resharePost;
	return typeof path === 'string' && path.length > 0 ? path : null;
}

/**
 * Build a Jetpack admin URL for a given page slug, honoring any subdirectory
 * WordPress install path. Reads the path-aware `site.admin_url` Jetpack injects
 * (e.g. `https://example.com/blog/wp-admin/` for installs under `/blog/`),
 * mirroring Jetpack's own `getAdminUrl` helper. Falls back to
 * `${origin}/wp-admin/` only if the global is missing — a rare edge case since
 * the share button's visibility gate already requires Jetpack to be loaded.
 * @param path - The admin page slug to append, e.g. `admin.php?page=jetpack-social`.
 * @returns The full admin URL.
 */
export function getJetpackAdminUrl( path: string ): string {
	const adminBase = getJetpackScriptData()?.site?.admin_url;
	if ( typeof adminBase === 'string' && adminBase.length > 0 ) {
		return `${ adminBase }${ path }`;
	}
	return `${ window.location.origin }/wp-admin/${ path }`;
}
