/* global fullSiteEditing */

/**
 * External dependencies
 */
import { use } from '@wordpress/data';

// The purpose of this override is to prevent trash action from deleting template CPTs.
use( ( registry ) => {
	return {
		dispatch: ( namespace ) => {
			const actions = { ...registry.dispatch( namespace ) };
			const { editorPostType } = fullSiteEditing;

			if (
				namespace === 'core/editor' &&
				actions.trashPost &&
				editorPostType === 'wp_template_part'
			) {
				actions.trashPost = () => {};
			}

			return actions;
		},
	};
} );
