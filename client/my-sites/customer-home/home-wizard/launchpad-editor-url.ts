/**
 * URL builders for Launchpad task CTAs that need to bypass Calypso's
 * `/post/:slug` and `/page/:slug` routes.
 *
 * Why bypass Calypso? Calypso's post/page routes redirect via
 * `window.location.replace`, which drops `#hash` fragments. The wpcom-block-
 * editor reads `window.location.hash` to decide whether to fire the
 * Launchpad's post-publish snackbar (see
 * `apps/wpcom-block-editor/.../onboarding-next-step-after-publishing-post.jsx`).
 * Navigating directly to the wp-admin editor URL preserves the hash through
 * the load, so the snackbar fires after publish.
 *
 * Hashes (kept in sync with the wpcom-block-editor feature):
 *  - `#publish-first-post`: first-post flow only (legacy specific copy).
 *  - `#launchpad-next-steps`: generic page-creating tasks (Gallery, Events,
 *    About, Contact, etc.). Any post type; "Published! Back to your next
 *    steps." copy.
 *
 * The `?origin=` query arg lets the snackbar's "Next steps" action link back
 * to the Calypso instance the user came from (so localhost / wpcalypso /
 * production all link home correctly).
 */

export const LAUNCHPAD_GENERIC_HASH = '#launchpad-next-steps';
export const FIRST_POST_HASH = '#publish-first-post';

type BuildEditorUrlArgs = {
	siteAdminUrl: string;
	/** Existing draft to open. Omit to open a fresh `post-new.php`. */
	postId?: number;
	/** wp-admin post type. `post` for blog posts, `page` for everything else. */
	postType: 'post' | 'page';
	/** Hash fragment the editor will read after load. */
	hash: string;
};

/**
 * Build a wp-admin editor URL preserving the Launchpad hash + origin.
 *
 * Use `window.location.href = buildLaunchpadEditorUrl(...)` to navigate — a
 * Calypso `page()` call would route through the SPA and drop the hash.
 */
export function buildLaunchpadEditorUrl( {
	siteAdminUrl,
	postId,
	postType,
	hash,
}: BuildEditorUrlArgs ): string {
	const origin = encodeURIComponent( window.location.origin );
	const editor = postId
		? `${ siteAdminUrl }post.php?post=${ postId }&action=edit`
		: `${ siteAdminUrl }post-new.php?post_type=${ postType }`;
	return `${ editor }&origin=${ origin }${ hash }`;
}
