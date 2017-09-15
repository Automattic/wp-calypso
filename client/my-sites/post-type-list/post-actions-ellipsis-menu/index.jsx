/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Children, cloneElement } from 'react';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import PostActionsEllipsisMenuEdit from './edit';
import PostActionsEllipsisMenuStats from './stats';
import PostActionsEllipsisMenuPublish from './publish';
import PostActionsEllipsisMenuShare from './share';
import PostActionsEllipsisMenuTrash from './trash';
import PostActionsEllipsisMenuView from './view';
import PostActionsEllipsisMenuRestore from './restore';
import PostActionsEllipsisMenuDuplicate from './duplicate';

export default function PostActionsEllipsisMenu( { globalId, includeDefaultActions, children } ) {
	let actions = [];

	if ( includeDefaultActions ) {
		actions.push(
			<PostActionsEllipsisMenuEdit key="edit" />,
			<PostActionsEllipsisMenuView key="view" />,
			<PostActionsEllipsisMenuStats key="stats" />,
			<PostActionsEllipsisMenuPublish key="publish" />,
			<PostActionsEllipsisMenuShare key="share" />,
			<PostActionsEllipsisMenuRestore key="restore" />,
			<PostActionsEllipsisMenuDuplicate key="duplicate" />,
			<PostActionsEllipsisMenuTrash key="trash" />
		);
	}

	children = Children.toArray( children );
	if ( children.length ) {
		if ( actions.length ) {
			actions.push( <PopoverMenuSeparator key="separator" /> );
		}

		actions = actions.concat( children );
	}

	return (
		<div className="post-actions-ellipsis-menu">
			<EllipsisMenu position="bottom left" disabled={ ! globalId }>
				{ actions.map( ( action ) => cloneElement( action, { globalId } ) ) }
			</EllipsisMenu>
		</div>
	);
}

PostActionsEllipsisMenu.propTypes = {
	globalId: PropTypes.string,
	includeDefaultActions: PropTypes.bool,
	children: PropTypes.node
};

PostActionsEllipsisMenu.defaultProps = {
	includeDefaultActions: true
};
