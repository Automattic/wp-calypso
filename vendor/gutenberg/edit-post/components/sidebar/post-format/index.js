/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostFormat as PostFormatForm, PostFormatCheck } from '@wordpress/editor';

export function PostFormat() {
	return (
		<PostFormatCheck>
			<PanelRow>
				<PostFormatForm />
			</PanelRow>
		</PostFormatCheck>
	);
}

export default PostFormat;
