/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostAuthor as PostAuthorForm, PostAuthorCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';

export function PostAuthor() {
	return (
		<PostAuthorCheck>
			<PanelRow>
				<PostAuthorForm />
			</PanelRow>
		</PostAuthorCheck>
	);
}

export default PostAuthor;
