import { select } from '@wordpress/data';

type EditorType = 'site' | 'post' | 'page';
export const getEditorType = (): EditorType | undefined => {
	const editorSelector = select( 'core/editor' );
	const postType = editorSelector.getCurrentPostType();
	switch ( postType ) {
		case null:
			return 'site';
		case 'post':
			return 'post';
		case 'page':
			return 'page';
		default:
			return undefined;
	}
};
