/**
 * External dependencies
 */
import React, { Component } from 'react';
import { filter, get, isNil, keyBy, keys, map, omit } from 'lodash';

/**
 * `CommentFaker` is a HOC to easily test the Comments Management without the necessity of real data or actions.
 *
 * It takes the comments passed via props (with mock data, Redux-connected, etc.) and puts them in its internal state.
 * Then passes them and various actions (status and like setters) to the actual comment list component.
 *
 * Once data and actions will be completely Reduxified, it will be enough to remove the `CommentFaker` call
 * and use the `mapDispatchToProps` actions instead, leaving this component still useful for testing purposes.
 */
export const CommentFaker = WrappedCommentList => class extends Component {
	state = {
		comments: {},
	};

	componentWillMount() {
		this.getCommentsFromProps( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.comments.length ) {
			this.getCommentsFromProps( nextProps );
		}
	}

	deleteCommentPermanently = commentId => this.doAction( [ commentId ], { status: 'delete' } );

	/**
	 * Sets a status and/or a like value to a list of comments.
	 *
	 * @param {Array}  commentIds
	 * @param {Object} action
	 * @param {bool}   action.i_like
	 * @param {string} action.status
	 */
	doAction = ( commentIds, { i_like, status } ) => {
		if ( 'delete' === status ) {
			return this.setState( {
				comments: omit( this.state.comments, commentIds ),
			} );
		}

		const editedComments = keyBy( map( commentIds, commentId => {
			const comment = this.state.comments[ commentId ];
			let newLikeValue, newStatusValue;

			if ( isNil( i_like ) ) {
				// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
				newLikeValue = 'approved' === status ? comment.i_like : false;
			} else {
				newLikeValue = i_like;
			}

			if ( isNil( status ) ) {
				newStatusValue = i_like ? 'approved' : comment.status;
			} else {
				newStatusValue = status;
			}

			return {
				...comment,
				i_like: newLikeValue,
				status: newStatusValue,
			};
		} ), 'ID' );

		this.setState( { comments: {
			...this.state.comments,
			...editedComments,
		} } );
	}

	filterCommentsByStatus = () => 'all' === this.props.status
		? filter( this.state.comments, ( { status } ) => ( 'approved' === status || 'unapproved' === status ) )
		: filter( this.state.comments, ( { status } ) => ( this.props.status === status ) );

	getCommentsFromProps = ( { comments } ) => this.setState( { comments: keyBy( comments, 'ID' ) } );

	setBulkStatus = ( commentIds, status ) => this.doAction( commentIds, { status } );

	setCommentLike = ( commentId, i_like ) => this.doAction( [ commentId ], { i_like } );

	setCommentStatus = ( commentId, status ) => this.doAction( [ commentId ], { status } );

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
	undoAction = comments => {
		const editedComments = keyBy( map( comments, ( { ID, i_like, status } ) => ( {
			...this.state.comments[ ID ],
			i_like,
			status,
		} ) ), 'ID' );

		this.setState( { comments: {
			...this.state.comments,
			...editedComments,
		} } );
	}

	undoBulkStatus = comments => this.undoAction( comments );

	render = () =>
		<WrappedCommentList
			{ ...this.props }
			comments={ this.filterCommentsByStatus() }
			deleteCommentPermanently={ this.deleteCommentPermanently }
			setBulkStatus={ this.setBulkStatus }
			setCommentLike={ this.setCommentLike }
			setCommentStatus={ this.setCommentStatus }
			undoBulkStatus={ this.undoBulkStatus }
		/>;
};

export default CommentFaker;
