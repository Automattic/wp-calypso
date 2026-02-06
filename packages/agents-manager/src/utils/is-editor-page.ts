/**
 * Checks if the current page is a site editor or post editor.
 */
export function isEditorPage(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const { href, search } = window.location;

	// Site editor
	if ( href.includes( '/wp-admin/site-editor.php' ) ) {
		return true;
	}

	// Post/page editor
	if ( href.includes( '/wp-admin/post.php' ) || href.includes( '/wp-admin/post-new.php' ) ) {
		const postType = new URLSearchParams( search ).get( 'post_type' );
		return ! postType || [ 'post', 'page' ].includes( postType );
	}

	return false;
}
