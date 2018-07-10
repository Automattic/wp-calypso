/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostTrash as PostTrashLink, PostTrashCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';

export default function PostTrash() {
	return (
		<PostTrashCheck>
			<PanelRow>
				<PostTrashLink />
			</PanelRow>
		</PostTrashCheck>
	);
}
