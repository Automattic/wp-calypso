/**
 * Read the Jetpack Social "reshare post" REST path from the global script-data
 * blob that Jetpack injects on pages where Jetpack Social is loaded.
 *
 * Image Studio runs in its own bundle and intentionally avoids importing from
 * `@automattic/jetpack-script-data`. Encapsulating the window read here keeps
 * the global dependency in one place and lets callers branch on `null` cleanly.
 *
 * @returns The path template (e.g. `/wpcom/v2/publicize/share-post/{postId}`)
 *          or `null` if Jetpack Social isn't available on this page.
 */
export function getReelSharePostPath(): string | null {
	const scriptData = (
		window as unknown as {
			JetpackScriptData?: { social?: { api_paths?: { resharePost?: unknown } } };
		}
	 ).JetpackScriptData;

	const path = scriptData?.social?.api_paths?.resharePost;
	return typeof path === 'string' && path.length > 0 ? path : null;
}
