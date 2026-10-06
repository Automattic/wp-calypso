/**
 * Whether the current page is the site editor, a post or page editor, or a custom post type's
 * block editor.
 *
 * Reads the admin body classes set in `wp-admin/admin-header.php`, not the URL: the edit URL
 * (`post.php?post=N`) omits the post type.
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

	// Post editor (`post.php` / `post-new.php`).
	const isPostEditorScreen =
		classList.contains( 'post-php' ) || classList.contains( 'post-new-php' );
	const isPostOrPage =
		classList.contains( 'post-type-post' ) || classList.contains( 'post-type-page' );
	const isBlockEditor = classList.contains( 'block-editor-page' );

	return isPostEditorScreen && ( isPostOrPage || isBlockEditor );
}
