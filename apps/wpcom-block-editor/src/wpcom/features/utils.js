/**
 * Determines the type of the block editor.
 *
 * @returns {'post'|'site'|undefined} editor's type
 */
export const getEditorType = () => {
	if ( document.querySelector( '.edit-post-layout' ) ) {
		return 'post';
	}

	if ( document.querySelector( '#edit-site-editor' ) ) {
		return 'site';
	}

	return undefined;
};
