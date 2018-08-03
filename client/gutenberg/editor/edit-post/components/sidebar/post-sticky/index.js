/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostSticky as PostStickyForm, PostStickyCheck } from '@wordpress/editor';

export function PostSticky() {
	return (
		<PostStickyCheck>
			<PanelRow>
				<PostStickyForm />
			</PanelRow>
		</PostStickyCheck>
	);
}

export default PostSticky;
