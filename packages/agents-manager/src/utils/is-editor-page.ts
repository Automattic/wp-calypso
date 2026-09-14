/**
 * Whether the current page is the post/page block editor or the site editor.
 *
 * Reads WordPress's server-set admin body classes — present in the initial HTML for both "new"
 * and "edit" screens — rather than the URL, since the edit URL (`post.php?post=N`) omits the
 * post type and would misclassify custom post types. Custom post types are intentionally
 * excluded (the post type comes from `post-type-{type}`, set in `wp-admin/admin-header.php`).
 */
export function isEditorPage(): boolean {
	if ( typeof document === 'undefined' || ! document.body ) {
		return false;
	}

	const { classList } = document.body;

	// Site editor.
	if ( classList.contains( 'site-editor-php' ) ) {
		return true;
	}

	// Post or page editor (`post.php` / `post-new.php`), excluding custom post types.
	const isPostEditorScreen =
		classList.contains( 'post-php' ) || classList.contains( 'post-new-php' );
	const isPostOrPage =
		classList.contains( 'post-type-post' ) || classList.contains( 'post-type-page' );

	return isPostEditorScreen && isPostOrPage;
}
