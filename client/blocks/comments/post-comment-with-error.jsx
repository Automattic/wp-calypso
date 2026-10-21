import PropTypes from 'prop-types';
import { useState } from 'react';
import PostCommentForm from './form';

import './post-comment.scss'; // intentional, shares styles
import './post-comment-with-error.scss';

function PostCommentWithError( {
	activeReplyCommentId,
	commentId,
	commentsTree,
	post,
	repliesList,
} ) {
	const commentParentId = commentsTree?.[ commentId ]?.data?.parent?.ID ?? null;
	const commentText = commentsTree?.[ commentId ]?.data?.content;
	const placeholderError = commentsTree?.[ commentId ]?.data?.placeholderError;
	const placeholderErrorType = commentsTree?.[ commentId ]?.data?.placeholderErrorType;

	const [ comment, setComment ] = useState( commentText );

	if ( activeReplyCommentId !== commentParentId ) {
		return null;
	}

	return (
		<li className="comments__comment is-error">
			<PostCommentForm
				commentText={ comment }
				error={ placeholderError }
				errorType={ placeholderErrorType }
				onUpdateCommentText={ setComment }
				parentCommentId={ commentParentId }
				placeholderId={ commentId }
				post={ post }
			/>
			{ repliesList }
		</li>
	);
}

PostCommentWithError.propTypes = {
	commentId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	commentsTree: PropTypes.object.isRequired,
	onUpdateCommentText: PropTypes.func.isRequired,
	post: PropTypes.object.isRequired,
	repliesList: PropTypes.object,
};

export default PostCommentWithError;
