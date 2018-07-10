/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';

function PostExcerptCheck( props ) {
	return <PostTypeSupportCheck { ...props } supportKeys="excerpt" />;
}

export default PostExcerptCheck;
