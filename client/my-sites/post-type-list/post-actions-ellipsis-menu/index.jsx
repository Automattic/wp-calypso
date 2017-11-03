/**
 * External dependencies
 *
 * @format
 */
import { connect } from 'react-redux';
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
import QueryPostTypes from 'components/data/query-post-types';
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';

function PostActionsEllipsisMenu( {
	globalId,
	siteId,
	isKnownType,
	includeDefaultActions,
	children,
} ) {
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
			{ siteId && ! isKnownType && <QueryPostTypes siteId={ siteId } /> }
			<EllipsisMenu position="bottom left" disabled={ ! globalId }>
				{ actions.map( action => cloneElement( action, { globalId } ) ) }
			</EllipsisMenu>
		</div>
	);
}

PostActionsEllipsisMenu.propTypes = {
	globalId: PropTypes.string,
	siteId: PropTypes.number,
	isKnownType: PropTypes.bool,
	includeDefaultActions: PropTypes.bool,
	children: PropTypes.node,
};

PostActionsEllipsisMenu.defaultProps = {
	includeDefaultActions: true,
};

export default connect( ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const type = getPostType( state, post.site_ID, post.type );

	return {
		siteId: post.site_ID,
		isKnownType: !! type,
	};
} )( PostActionsEllipsisMenu );
