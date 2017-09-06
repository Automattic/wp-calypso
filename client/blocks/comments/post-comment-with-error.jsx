/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import PostCommentForm from './form';

export default class PostCommentWithError extends React.Component {
	renderCommentForm() {
		const post = this.props.post;
		const commentText = this.props.commentsTree.getIn( [
			this.props.commentId,
			'data',
			'content',
		] );
		const commentParentId = this.props.commentsTree.getIn( [ this.props.commentId, 'parentId' ] );
		const placeholderError = this.props.commentsTree.getIn( [
			this.props.commentId,
			'data',
			'placeholderError',
		] );
		const onUpdateCommentText = this.props.onUpdateCommentText;

		return (
			<PostCommentForm
				ref="postCommentForm"
				post={ post }
				parentCommentId={ commentParentId }
				commentText={ commentText }
				onUpdateCommentText={ onUpdateCommentText }
				placeholderId={ this.props.commentId }
				error={ placeholderError }
			/>
		);
	}

	render() {
		return (
			<li className="comments__comment is-error">
				{ this.renderCommentForm() }
				{ this.props.repliesList }
			</li>
		);
	}
}

PostCommentWithError.propTypes = {
	post: PropTypes.object.isRequired,
	repliesList: PropTypes.object.isRequired,
	commentsTree: PropTypes.object.isRequired,
	onUpdateCommentText: PropTypes.func.isRequired,
	commentId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] )
		.isRequired,
};
