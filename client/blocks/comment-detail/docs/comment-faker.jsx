/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { filter, isNil, keyBy, map, omit, orderBy, slice } from 'lodash';

import { createPlaceholderComment } from 'state/data-layer/wpcom/comments';

const COMMENTS_PER_PAGE = 2;

/**
 * `CommentFaker` is a HOC to easily test the Comments Management without the necessity of real data or actions.
 *
 * It takes the comments passed via props (with mock data, Redux-connected, etc.) and puts them in its internal state.
 * Then passes them and various actions (status and like setters) to the actual comment list component.
 *
 * Once data and actions will be completely Reduxified, it will be enough to remove the `CommentFaker` call
 * and use the `mapDispatchToProps` actions instead, leaving this component still useful for testing purposes.
 */
export const CommentFaker = WrappedCommentList =>
	class extends Component {
		state = {
			comments: {},
			commentsPage: 1,
		};

		componentWillMount() {
			this.getCommentsFromProps( this.props );
		}

		componentWillReceiveProps( nextProps ) {
			if (
				this.props.comments.length !== nextProps.comments.length ||
				this.props.siteId !== nextProps.siteId
			) {
				this.getCommentsFromProps( nextProps );
			}

			if ( this.props.status !== nextProps.status ) {
				this.setState( { commentsPage: 1 } );
			}
		}

		deleteCommentPermanently = commentId =>
			this.setCommentStatusOrLike( [ commentId ], { status: 'delete' } );

		filterCommentsByStatus = () =>
			'all' === this.props.status
				? filter(
						this.state.comments,
						( { status } ) => 'approved' === status || 'unapproved' === status
					)
				: filter( this.state.comments, ( { status } ) => this.props.status === status );

		getCommentsFromProps = ( { comments } ) =>
			this.setState( { comments: keyBy( comments, 'ID' ) } );

		getCommentsPage = comments => {
			const startingIndex = ( this.state.commentsPage - 1 ) * COMMENTS_PER_PAGE;
			const orderedComments = orderBy( comments, 'date', 'desc' );
			return slice( orderedComments, startingIndex, startingIndex + COMMENTS_PER_PAGE );
		};

		setBulkStatus = ( commentIds, status ) => this.setCommentStatusOrLike( commentIds, { status } );

		setCommentLike = ( commentId, i_like ) =>
			this.setCommentStatusOrLike( [ commentId ], { i_like } );

		setCommentStatus = ( commentId, status ) =>
			this.setCommentStatusOrLike( [ commentId ], { status } );

		/**
	 * Sets a status and/or a like value to a list of comments.
	 *
	 * @param {Array}  commentIds
	 * @param {Object} action
	 * @param {bool}   action.i_like
	 * @param {string} action.status
	 */
		setCommentStatusOrLike = ( commentIds, { i_like, status } ) => {
			if ( 'delete' === status ) {
				return this.setState( {
					comments: omit( this.state.comments, commentIds ),
				} );
			}

			const editedComments = keyBy(
				map( commentIds, commentId => {
					const comment = this.state.comments[ commentId ];
					let newLikeValue, newStatusValue;

					if ( isNil( i_like ) ) {
						// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
						newLikeValue = 'approved' === status ? comment.i_like : false;
					} else {
						newLikeValue = i_like;
					}

					if ( isNil( status ) ) {
						// If like changes to true, also approve the comment
						newStatusValue = i_like ? 'approved' : comment.status;
					} else {
						newStatusValue = status;
					}

					return {
						...comment,
						i_like: newLikeValue,
						status: newStatusValue,
					};
				} ),
				'ID'
			);

			this.setState( {
				comments: {
					...this.state.comments,
					...editedComments,
				},
			} );
		};

		setCommentsPage = commentsPage => this.setState( { commentsPage } );

		submitComment = ( comment, options = { alsoApprove: false } ) => {
			const { comments } = this.state;
			const parentComment = comments[ comment.parentId ];

			const newComment = {
				...createPlaceholderComment( comment.content, comment.postId, comment.parentId ),
				author: {
					avatar_URL: comment.authorAvatarUrl,
					name: comment.authorName,
					URL: comment.authorUrl,
				},
				i_like: false,
				like_count: 0,
				post: {
					title: comment.postTitle,
				},
				status: 'approved',
				URL: comment.URL,
			};

			this.setState( {
				comments: {
					...comments,
					[ parentComment.ID ]: {
						...parentComment,
						status: 'approved',
					},
					[ newComment.ID ]: newComment,
				},
			} );
		};

		/**
	 * Resets the status and the like value of a list of comments to their previous values.
	 *
	 * `comments` is the array of comments that will receive the action.
	 * It can contain complete comment objects, but in fact it only needs their (previous) `ID`, `i_like`, and `status` properties.
	 *
	 * @param {Array}  comments
	 * @param {int}    comments[].ID
	 * @param {bool}   comments[].i_like
	 * @param {string} comments[].status
	 */
		undoSetCommentStatusOrLike = comments => {
			const editedComments = keyBy(
				map( comments, ( { ID, i_like, status } ) => ( {
					...this.state.comments[ ID ],
					i_like,
					status,
				} ) ),
				'ID'
			);

			this.setState( {
				comments: {
					...this.state.comments,
					...editedComments,
				},
			} );
		};

		undoBulkStatus = comments => this.undoSetCommentStatusOrLike( comments );

		render = () => {
			const { commentsPage } = this.state;

			const filteredComments = this.filterCommentsByStatus();
			const pageOfComments = this.getCommentsPage( filteredComments );

			return (
				<WrappedCommentList
					{ ...this.props }
					comments={ pageOfComments }
					commentsCount={ filteredComments.length }
					commentsPage={ commentsPage }
					deleteCommentPermanently={ this.deleteCommentPermanently }
					setBulkStatus={ this.setBulkStatus }
					setCommentLike={ this.setCommentLike }
					setCommentsPage={ this.setCommentsPage }
					setCommentStatus={ this.setCommentStatus }
					submitComment={ this.submitComment }
					undoBulkStatus={ this.undoBulkStatus }
				/>
			);
		};
	};

export default CommentFaker;
