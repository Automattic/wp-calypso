import { select } from '@wordpress/data';

/**
 * Post (Post Type: ‘post’)
 * Page (Post Type: ‘page’)
 * Attachment (Post Type: ‘attachment’)
 * Revision (Post Type: ‘revision’)
 * Navigation menu (Post Type: ‘nav_menu_item’)
 * Block templates (Post Type: ‘wp_template’)
 * Template parts (Post Type: ‘wp_template_part’)
 *
 * @see https://developer.wordpress.org/themes/basics/post-types/#default-post-types
 */

type PostType =
	| 'post'
	| 'page'
	| 'attachment'
	| 'revision'
	| 'nav_menu_item'
	| 'wp_template'
	| 'wp_template_part'
	| null;

type EditorType = 'site' | PostType;

export const getEditorType = (): EditorType | undefined => {
	/**
	 * Beware when using this method to figure out if we are in the site editor.
	 *
	 * @see https://github.com/WordPress/gutenberg/issues/46616#issuecomment-1355301090
	 * @see https://github.com/Automattic/jetpack/blob/2e56d0d/projects/plugins/jetpack/extensions/shared/get-editor-type.js
	 */
	if ( select( 'core/edit-site' ) ) {
		return 'site';
	}

	if ( select( 'core/editor' ) ) {
		return select( 'core/editor' ).getCurrentPostType() as PostType;
	}

	return undefined;
};
