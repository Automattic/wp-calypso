import { some } from 'lodash';
import PropTypes from 'prop-types';
import PostCommentForm from './form';

const noop = () => {};

/*
 * A component for displaying a comment form at the root of a conversation.
 */
const PostCommentFormRoot = ( {
	post,
	commentText,
	activeReplyCommentId,
	commentsTree,
	onUpdateCommentText = noop,
	isInlineComment,
} ) => {
	// Are we displaying the comment form elsewhere? If so, don't render the root form.
	if (
		activeReplyCommentId ||
		some( commentsTree, ( comment ) => {
			return comment.data && comment.data.isPlaceholder && ! comment.data.parent;
		} )
	) {
		return null;
	}

	return (
		<PostCommentForm
			post={ post }
			parentCommentId={ null }
			commentText={ commentText }
			onUpdateCommentText={ onUpdateCommentText }
			isInlineComment={ isInlineComment }
		/>
	);
};

PostCommentFormRoot.propTypes = {
	post: PropTypes.object.isRequired,
	commentText: PropTypes.string,
	activeReplyCommentId: PropTypes.number,
	commentsTree: PropTypes.object,
	onUpdateCommentText: PropTypes.func,
	isInlineComment: PropTypes.bool,
};

export default PostCommentFormRoot;
