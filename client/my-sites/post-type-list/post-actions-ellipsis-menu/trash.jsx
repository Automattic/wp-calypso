/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { trashPost, deletePost } from 'state/posts/actions';
import { canCurrentUser } from 'state/selectors';
import { getPost } from 'state/posts/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getPostType } from 'state/post-types/selectors';

class PostActionsEllipsisMenuTrash extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
		canDelete: PropTypes.bool,
		trashPost: PropTypes.func,
		deletePost: PropTypes.func,
		onTrashClick: PropTypes.func,
		onDeleteClick: PropTypes.func,
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
			this.props.onTrashClick();
			this.props.trashPost( siteId, postId );
		} else if ( confirm( translate( 'Are you sure you want to permanently delete this post?' ) ) ) {
			this.props.onDeleteClick();
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
				{ 'trash' === status ? (
					translate( 'Delete Permanently' )
				) : (
					translate( 'Trash', { context: 'verb' } )
				) }
			</PopoverMenuItem>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const userId = getCurrentUserId( state );
	const isAuthor = post.author && post.author.ID === userId;

	return {
		postId: post.ID,
		siteId: post.site_ID,
		status: post.status,
		canDelete: canCurrentUser(
			state,
			post.site_ID,
			isAuthor ? 'delete_posts' : 'delete_others_posts'
		),
		type: getPostType( state, post.site_ID, post.type ),
	};
};

const mapDispatchToProps = { trashPost, deletePost, bumpStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const postType = get( stateProps, 'type.name' );
	const onTrashClick = () => (
		bumpStatGenerator( postType, 'trash', dispatchProps.bumpStat ),
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_trashed', {
			post_type: postType,
		} )
	);
	const onDeleteClick = () => (
		bumpStatGenerator( postType, 'delete', dispatchProps.bumpStat ),
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_deleted', {
			post_type: postType,
		} )
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, {
		onTrashClick,
		onDeleteClick,
	} );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuTrash )
);
