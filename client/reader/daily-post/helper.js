/**
 * Internal Dependencies
 */
import config from 'config';

export function isDailyPost( post ) {
	return post.site_ID === config( 'daily_post_blog_id' );
}

export function getDailyPostType( post ) {
	const types = {
		dp_prompt: 'prompt',
		dp_photo_challenge: 'photo',
		dp_discover: 'discover'
	};

	return types[ post.type ];
}
