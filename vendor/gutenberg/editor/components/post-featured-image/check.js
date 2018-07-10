/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';
import ThemeSupportCheck from '../theme-support-check';

function PostFeaturedImageCheck( props ) {
	return (
		<ThemeSupportCheck supportKeys="post-thumbnails">
			<PostTypeSupportCheck { ...props } supportKeys="thumbnail" />
		</ThemeSupportCheck>
	);
}

export default PostFeaturedImageCheck;
