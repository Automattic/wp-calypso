export const getEditorType = () => {
	if ( document.querySelector( '#editor .edit-post-layout' ) ) {
		return 'post';
	}

	if ( document.querySelector( '#site-editor' ) ) {
		return 'site';
	}

	if ( document.querySelector( '#widgets-editor' ) ) {
		return 'widgets';
	}

	if ( document.querySelector( '#customize-controls .customize-widgets__sidebar-section.open' ) ) {
		return 'customize-widgets';
	}

	return undefined;
};
