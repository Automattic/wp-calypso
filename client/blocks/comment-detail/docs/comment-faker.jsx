/**
 * External dependencies
 */
import React, { Component } from 'react';
import { keyBy, omit } from 'lodash';

export const CommentFaker = WrappedCommentList => class extends Component {
	state = {
		comments: {},
	};

	componentWillMount() {
		if ( this.props.comments.length ) {
			this.setState( { comments: keyBy( this.props.comments, 'ID' ) } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.comments.length ) {
			this.setState( { comments: keyBy( nextProps.comments, 'ID' ) } );
		}
	}

	deleteCommentPermanently = commentId => this.setState( { comments: omit( this.state.comments, commentId ) } );

	setCommentLike = ( commentId, likeValue ) => {
		const comment = this.state.comments[ commentId ];

		// If like changes to true, also approve the comment
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: likeValue,
					status: likeValue ? 'approved' : comment.status,
				}
			},
		} );
	}

	setCommentStatus = ( commentId, status ) => {
		const comment = this.state.comments[ commentId ];

		// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: 'approved' === status ? comment.i_like : false,
					status,
				}
			},
		} );
	}

	toggleCommentLike = commentId => {
		const comment = this.state.comments[ commentId ];
		const likeValue = ! comment.i_like;

		// If like changes to true, also approve the comment
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: likeValue,
					status: likeValue ? 'approved' : comment.status,
				}
			},
		} );
	}

	render() {
		return (
			<WrappedCommentList
				{ ...this.props }
				comments={ this.state.comments }
				deleteCommentPermanently={ this.deleteCommentPermanently }
				setCommentLike={ this.setCommentLike }
				setCommentStatus={ this.setCommentStatus }
				toggleCommentLike={ this.toggleCommentLike }
			/>
		);
	}
};

export default CommentFaker;
