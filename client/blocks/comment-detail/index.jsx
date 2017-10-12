/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, isUndefined } from 'lodash';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryComment from 'components/data/query-comment';
import CommentDetailComment from './comment-detail-comment';
import CommentDetailEdit from './comment-detail-edit';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';
import CommentDetailReply from './comment-detail-reply';
import { getSiteComment, getSiteSetting } from 'state/selectors';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { isEmailBlacklisted } from './utils';
import { getMinimalComment } from './utils';

export class CommentDetail extends Component {
	static propTypes = {
		comment: PropTypes.object,
		commentId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		commentIsLiked: PropTypes.bool,
		commentIsSelected: PropTypes.bool,
		commentStatus: PropTypes.string,
		deleteCommentPermanently: PropTypes.func,
		editComment: PropTypes.func,
		isBulkEdit: PropTypes.bool,
		isLoading: PropTypes.bool,
		postId: PropTypes.number,
		refreshCommentData: PropTypes.bool,
		replyComment: PropTypes.func,
		setCommentStatus: PropTypes.func,
		siteId: PropTypes.number,
		toggleCommentLike: PropTypes.func,
		toggleCommentSelected: PropTypes.func,
	};

	static defaultProps = {
		commentIsSelected: false,
		isBulkEdit: false,
		isLoading: true,
		refreshCommentData: false,
	};

	state = {
		isEditMode: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkEdit && ! this.props.isBulkEdit ) {
			this.setState( { isExpanded: false } );
		}
	}

	deleteCommentPermanently = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentId, deleteCommentPermanently, postId, translate } = this.props;
		if (
			isUndefined( window ) ||
			window.confirm( translate( 'Delete this comment permanently?' ) )
		) {
			deleteCommentPermanently( commentId, postId );
		}
	};

	toggleApprove = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		const shouldPersist = 'approved' === commentStatus || 'unapproved' === commentStatus;

		setCommentStatus(
			this.props.comment,
			'approved' === commentStatus ? 'unapproved' : 'approved',
			{
				doPersist: shouldPersist,
				showNotice: true,
			}
		);

		if ( shouldPersist ) {
			this.setState( { isExpanded: false } );
		}
	};

	toggleEditMode = () => this.setState( ( { isEditMode } ) => ( { isEditMode: ! isEditMode } ) );

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
		}
	};

	toggleLike = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		this.props.toggleCommentLike( this.props.comment );
	};

	toggleSelected = () => this.props.toggleCommentSelected( this.props.comment );

	toggleSpam = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus( this.props.comment, 'spam' === commentStatus ? 'approved' : 'spam' );
	};

	toggleTrash = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus( this.props.comment, 'trash' === commentStatus ? 'approved' : 'trash' );
	};

	setCardRef = card => {
		this.commentCard = card;
	};

	keyHandler = event => {
		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );
		if ( this.state.isEditMode || ( this.state.isExpanded && ! commentHasFocus ) ) {
			return;
		}
		switch ( event.keyCode ) {
			case 32: // space
			case 13: // enter
				event.preventDefault();
				this.toggleExpanded();
				break;
		}
	};

	trackDeepReaderLinkClick = () => {
		const { isJetpack, parentCommentContent } = this.props;
		if ( isJetpack ) {
			return;
		}
		if ( parentCommentContent ) {
			return this.props.recordReaderCommentOpened();
		}
		this.props.recordReaderArticleOpened();
	};

	render() {
		const {
			authorIsBlocked,
			commentId,
			commentIsLiked,
			commentIsSelected,
			commentStatus,
			editComment,
			isBulkEdit,
			isLoading,
			refreshCommentData,
			replyComment,
			siteId,
		} = this.props;

		const { isEditMode, isExpanded } = this.state;

		const classes = classNames( 'comment-detail', {
			'author-is-blocked': authorIsBlocked,
			'comment-detail__placeholder': isLoading,
			'is-approved': 'approved' === commentStatus,
			'is-unapproved': 'unapproved' === commentStatus,
			'is-bulk-edit': isBulkEdit,
			'is-edit-mode': isEditMode,
			'is-expanded': isExpanded,
			'is-collapsed': ! isExpanded,
			'is-liked': commentIsLiked,
			'is-spam': 'spam' === commentStatus,
			'is-trash': 'trash' === commentStatus,
		} );

		return (
			<Card
				onKeyDown={ this.keyHandler }
				ref={ this.setCardRef }
				className={ classes }
				tabIndex="0"
			>
				{ refreshCommentData && <QueryComment commentId={ commentId } siteId={ siteId } /> }

				<CommentDetailHeader
					commentId={ commentId }
					commentIsSelected={ commentIsSelected }
					deleteCommentPermanently={ this.deleteCommentPermanently }
					isBulkEdit={ isBulkEdit }
					isEditMode={ isEditMode }
					isExpanded={ isExpanded }
					siteId={ siteId }
					toggleApprove={ this.toggleApprove }
					toggleEditMode={ this.toggleEditMode }
					toggleExpanded={ this.toggleExpanded }
					toggleLike={ this.toggleLike }
					toggleSelected={ this.toggleSelected }
					toggleSpam={ this.toggleSpam }
					toggleTrash={ this.toggleTrash }
				/>
				{ isExpanded && (
					<div className="comment-detail__content">
						<CommentDetailPost
							commentId={ commentId }
							siteId={ siteId }
							onClick={ this.trackDeepReaderLinkClick }
						/>

						{ isEditMode && (
							<CommentDetailEdit
								closeEditMode={ this.toggleEditMode }
								commentId={ commentId }
								editComment={ editComment }
								siteId={ siteId }
							/>
						) }

						{ ! isEditMode && (
							<div>
								<CommentDetailComment commentId={ commentId } siteId={ siteId } />

								<CommentDetailReply
									commentId={ commentId }
									replyComment={ replyComment }
									siteId={ siteId }
								/>
							</div>
						) }
					</div>
				) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { commentId, siteId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	const isLoading = isUndefined( comment );

	const postId = get( comment, 'post.ID' );
	const authorEmail = get( comment, 'author.email' );
	const siteBlacklist = getSiteSetting( state, siteId, 'blacklist_keys' );
	const authorIsBlocked = isEmailBlacklisted( siteBlacklist, authorEmail );

	return {
		authorIsBlocked,
		comment: getMinimalComment( comment ),
		commentId,
		commentIsLiked: get( comment, 'i_like' ),
		commentStatus: get( comment, 'status' ),
		commentType: get( comment, 'type', 'comment' ),
		isLoading,
		postId,
		siteId: get( comment, 'siteId', siteId ),
	};
};

const mapDispatchToProps = dispatch => ( {
	recordReaderArticleOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_article_opened' ),
				bumpStat( 'calypso_comment_management', 'article_opened' )
			)
		),
	recordReaderCommentOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_comment_opened' ),
				bumpStat( 'calypso_comment_management', 'comment_opened' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentDetail ) );
