/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostPendingStatus as PostPendingStatusForm, PostPendingStatusCheck } from '@wordpress/editor';

export function PostPendingStatus() {
	return (
		<PostPendingStatusCheck>
			<PanelRow>
				<PostPendingStatusForm />
			</PanelRow>
		</PostPendingStatusCheck>
	);
}

export default PostPendingStatus;
