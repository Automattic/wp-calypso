/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PostActionsEllipsisMenuEdit from './edit';
import PostActionsEllipsisMenuPublish from './publish';
import PostActionsEllipsisMenuTrash from './trash';
import PostActionsEllipsisMenuView from './view';
import PostActionsEllipsisMenuRestore from './restore';

export default function PostActionsEllipsisMenu( { globalId } ) {
	return (
		<div className="post-actions-ellipsis-menu">
			<EllipsisMenu position="bottom left">
				<PostActionsEllipsisMenuView globalId={ globalId } />
				<PostActionsEllipsisMenuPublish globalId={ globalId } />
				<PostActionsEllipsisMenuEdit globalId={ globalId } />
				<PostActionsEllipsisMenuRestore globalId={ globalId } />
				<PostActionsEllipsisMenuTrash globalId={ globalId } />
			</EllipsisMenu>
		</div>
	);
}

PostActionsEllipsisMenu.propTypes = {
	globalId: PropTypes.string
};
