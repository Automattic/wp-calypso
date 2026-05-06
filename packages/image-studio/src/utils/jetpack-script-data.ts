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
};

function getSocialScriptData(): JetpackSocialScriptData | undefined {
	return (
		window as unknown as {
			JetpackScriptData?: { social?: JetpackSocialScriptData };
		}
	 ).JetpackScriptData?.social;
}

/**
 * Read the Jetpack Social "reshare post" REST path.
 * @returns The path template (e.g. `/wpcom/v2/publicize/share-post/{postId}`)
 *          or `null` if Jetpack Social isn't available on this page.
 */
export function getReelSharePostPath(): string | null {
	const path = getSocialScriptData()?.api_paths?.resharePost;
	return typeof path === 'string' && path.length > 0 ? path : null;
}
