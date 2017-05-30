/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, map } from 'lodash';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * Internal dependencies
 */
import {
	createNotice,
	removeNotice,
} from 'state/notices/actions';
import getSiteComments from 'state/selectors/get-site-comments';
import CommentDetail from 'blocks/comment-detail';
import CommentNavigation from '../comment-navigation';

export class CommentList extends Component {
	static propTypes = {
		comments: PropTypes.array,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		comments: [],
		isBulkEdit: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.comments.length ) {
			this.setState( { comments: nextProps.comments } );
		}
	}

	getNoticeContent = ( commentId, newStatus, previousStatus ) => {
		this.props.removeNotice( `${ commentId }-newStatus` );

		const { translate } = this.props;
		const options = {
			button: translate( 'Undo' ),
			duration: 5000,
			id: `${ commentId }-newStatus`,
			isPersistent: true,
			onClick: () => this.setCommentStatus( commentId, previousStatus ),
		};

		switch ( newStatus ) {
			case 'approved':
				return {
					type: 'is-success',
					message: translate( 'Comment approved.' ),
					options,
				};
			case 'unapproved':
				return {
					type: 'is-info',
					message: translate( 'Comment unapproved.' ),
					options,
				};
			case 'spam':
				return {
					type: 'is-warning',
					message: translate( 'Comment marked as spam.' ),
					options,
				};
			case 'trash':
				return {
					type: 'is-error',
					message: translate( 'Comment moved to trash.' ),
					options,
				};
			case 'delete':
				return {
					type: 'is-error',
					message: translate( 'Comment deleted permanently.' ),
					options,
				};
		}
	}

	deleteForever = commentId => () => {
		const notice = this.getNoticeContent( commentId, 'delete', 'trash' );
		this.props.createNotice( notice.type, notice.message, notice.options );

		this.setState( {
			comments: filter( this.state.comments, comment => commentId !== comment.ID ),
		} );
	}

	toggleCommentLike = commentId => {
		const comments = map( this.state.comments, comment => {
			if ( commentId === comment.ID ) {
				const newLike = ! comment.i_like;
				// If like changes to true, also approve the comment
				return {
					...comment,
					i_like: newLike,
					status: newLike ? 'approved' : comment.status,
				};
			}
			return comment;
		} );

		this.setState( { comments } );
	};

	setCommentStatus = ( commentId, status ) => {
		let previousStatus = null;

		const comments = map( this.state.comments, comment => {
			if ( commentId === comment.ID && status !== comment.status ) {
				previousStatus = comment.status;
				// If status changes to unapproved/spam/trash, also remove the like
				return {
					...comment,
					i_like: 'approved' === status ? comment.i_like : false,
					status,
				};
			}
			return comment;
		} );

		// If previousStatus !== null it means the status changed
		if ( previousStatus ) {
			const notice = this.getNoticeContent( commentId, status, previousStatus );
			this.props.createNotice( notice.type, notice.message, notice.options );

			this.setState( { comments } );
		}
	};

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

	render() {
		const {
			siteId,
			siteSlug,
			status,
		} = this.props;
		const {
			comments,
			isBulkEdit,
		} = this.state;

		const filteredComments = 'all' === status
			? filter( comments, comment => 'approved' === comment.status || 'unapproved' === comment.status )
			: filter( comments, comment => status === comment.status );

		return (
			<div className="comment-list">
				<CommentNavigation { ...{
					isBulkEdit,
					siteSlug,
					status,
					toggleBulkEdit: this.toggleBulkEdit,
				} } />
				<ReactCSSTransitionGroup
					transitionEnterTimeout={ 0 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-detail__transition"
				>
					{ map( filteredComments, comment =>
						<CommentDetail
							commentId={ comment.ID }
							deleteForever={ this.deleteForever( comment.ID ) }
							isBulkEdit={ isBulkEdit }
							key={ `comment-${ siteId }-${ comment.ID }` }
							setCommentStatus={ this.setCommentStatus }
							siteId={ siteId }
							toggleCommentLike={ this.toggleCommentLike }
							{ ...comment }
						/>
					) }
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const comments = getSiteComments( state, siteId );
	return {
		comments,
		siteId,
	};
};

const mapDispatchToProps = {
	createNotice,
	removeNotice,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentList ) );
