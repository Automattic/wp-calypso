import PropTypes from 'prop-types';
import { Children, cloneElement } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuSeparator from 'calypso/components/popover-menu/separator';
import PostActionsEllipsisMenuComments from './comments';
import PostActionsEllipsisMenuCopyLink from './copy-link';
import PostActionsEllipsisMenuDuplicate from './duplicate';
import PostActionsEllipsisMenuEdit from './edit';
import PostActionsEllipsisMenuPublish from './publish';
import PostActionsEllipsisMenuRestore from './restore';
import PostActionsEllipsisMenuShare from './share';
import PostActionsEllipsisMenuStats from './stats';
import PostActionsEllipsisMenuTrash from './trash';
import PostActionsEllipsisMenuView from './view';

import './style.scss';

export default function PostActionsEllipsisMenu( { globalId, includeDefaultActions, children } ) {
	let actions = [];

	if ( includeDefaultActions ) {
		actions.push(
			<PostActionsEllipsisMenuEdit key="edit" />,
			<PostActionsEllipsisMenuView key="view" />,
			<PostActionsEllipsisMenuStats key="stats" />,
			<PostActionsEllipsisMenuComments key="comments" />,
			<PostActionsEllipsisMenuPublish key="publish" />,
			<PostActionsEllipsisMenuShare key="share" />,
			<PostActionsEllipsisMenuRestore key="restore" />,
			<PostActionsEllipsisMenuDuplicate key="duplicate" />,
			<PostActionsEllipsisMenuCopyLink key="copyLink" />,
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
};

PostActionsEllipsisMenu.defaultProps = {
	includeDefaultActions: true,
};
