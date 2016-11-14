/**
 * Internal Dependencies
 */
import config from 'config';

const types = {
	dp_prompt: 'prompt',
	dp_photo_challenge: 'photo',
	dp_discover: 'discover'
};
export function isDailyPostChallengeOrPrompt( post ) {
	return post.site_ID === config( 'daily_post_blog_id' ) && !! types[ post.type ];
}

export function getDailyPostType( post ) {
	return types[ post.type ];
}
