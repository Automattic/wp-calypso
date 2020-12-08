/* global fullSiteEditing */

/**
 * External dependencies
 */
import { use } from '@wordpress/data';

// The purpose of this override is to prevent Switch to Draft action for template CPTs.
use( ( registry ) => {
	return {
		dispatch: ( namespace ) => {
			const actions = { ...registry.dispatch( namespace ) };
			const { editorPostType } = fullSiteEditing;

			if (
				namespace === 'core/editor' &&
				actions.editPost &&
				editorPostType === 'wp_template_part'
			) {
				const originalEditPost = actions.editPost;

				actions.editPost = ( edits ) => {
					const { status } = edits;

					// Bail if editPost is attempting to set draft as status.
					if ( status === 'draft' ) {
						return;
					}

					// Proceed with the usual call otherwise.
					originalEditPost( edits );
				};
			}

			return actions;
		},
	};
} );
