/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { mc } from 'lib/analytics';
import { trashPost, deletePost } from 'state/posts/actions';
import { getPost } from 'state/posts/selectors';
import { getCurrentUserId, canCurrentUser } from 'state/current-user/selectors';

class PostActionsEllipsisMenuTrash extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
		canDelete: PropTypes.bool,
		trashPost: PropTypes.func,
		deletePost: PropTypes.func
	};

	constructor() {
		super( ...arguments );

		this.trashPost = this.trashPost.bind( this );
	}

	trashPost() {
		const { translate, siteId, postId, status } = this.props;
		if ( ! postId ) {
			return;
		}

		if ( 'trash' !== status ) {
			mc.bumpStat( 'calypso_cpt_actions', 'trash' );
			this.props.trashPost( siteId, postId );
		} else if ( confirm( translate( 'Are you sure you want to permanently delete this post?' ) ) ) {
			mc.bumpStat( 'calypso_cpt_actions', 'delete' );
			this.props.deletePost( siteId, postId );
		}
	}

	render() {
		const { translate, status, canDelete } = this.props;
		if ( ! canDelete ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.trashPost } icon="trash">
				{ 'trash' === status
					? translate( 'Delete Permanently' )
					: translate( 'Trash', { context: 'verb' } ) }
			</PopoverMenuItem>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const post = getPost( state, ownProps.globalId );
		if ( ! post ) {
			return {};
		}

		const userId = getCurrentUserId( state );
		const isAuthor = post.author && post.author.ID === userId;

		return {
			postId: post.ID,
			siteId: post.site_ID,
			status: post.status,
			canDelete: canCurrentUser( state, post.site_ID, isAuthor ? 'delete_posts' : 'delete_others_posts' )
		};
	},
	{ trashPost, deletePost }
)( localize( PostActionsEllipsisMenuTrash ) );
