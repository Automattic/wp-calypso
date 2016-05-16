// External Dependencies
import React from 'react';

// Internal Dependencies
import PostCommentForm from './form';

export default class PostCommentWithError extends React.Component {
	renderCommentForm() {
		const post = this.props.post;
		const commentText = this.props.commentsTree.getIn( [ this.props.commentId, 'data', 'content' ] );
		const commentParentId = this.props.commentsTree.getIn( [ this.props.commentId, 'parentId' ] );
		const placeholderError = this.props.commentsTree.getIn( [ this.props.commentId, 'data', 'placeholderError' ] );
		const onUpdateCommentText = this.props.onUpdateCommentText;

		return <PostCommentForm
			ref="postCommentForm"
			post={ post }
			parentCommentID={ commentParentId }
			commentText={ commentText }
			onUpdateCommentText={ onUpdateCommentText }
			placeholderId={ this.props.commentId }
			error={ placeholderError }
		/>;
	}

	render() {
		return (
			<li className="comment is-error">
				{ this.renderCommentForm() }
				{ this.props.repliesList }
			</li>
		);
	}
}

PostCommentWithError.propTypes = {
	post: React.PropTypes.object.isRequired,
	repliesList: React.PropTypes.object.isRequired,
	commentsTree: React.PropTypes.object.isRequired,
	onUpdateCommentText: React.PropTypes.func.isRequired,
	commentId: React.PropTypes.oneOfType( [
		React.PropTypes.string,
		React.PropTypes.number
	] ).isRequired
};
