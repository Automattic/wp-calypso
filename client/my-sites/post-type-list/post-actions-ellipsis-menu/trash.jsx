/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { trashPost, deletePost } from 'calypso/state/posts/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getPost } from 'calypso/state/posts/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

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
				{ 'trash' === status
					? translate( 'Delete Permanently' )
					: translate( 'Trash', { context: 'verb' } ) }
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
		type: post.type,
		canDelete: canCurrentUser(
			state,
			post.site_ID,
			isAuthor ? 'delete_posts' : 'delete_others_posts'
		),
	};
};

const mapDispatchToProps = { trashPost, deletePost, bumpStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpTrashStat = bumpStatGenerator( stateProps.type, 'trash', dispatchProps.bumpStat );
	const onTrashClick = () => {
		bumpTrashStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_trash', {
			post_type: stateProps.type,
		} );
	};
	const bumpDeleteStat = bumpStatGenerator( stateProps.type, 'delete', dispatchProps.bumpStat );
	const onDeleteClick = () => {
		bumpDeleteStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_delete', {
			post_type: stateProps.type,
		} );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, {
		onTrashClick,
		onDeleteClick,
	} );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuTrash ) );
