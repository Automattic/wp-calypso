/* eslint-disable max-len, quote-props*/
/**
 * External dependencies
 */
import cloneDeep from 'lodash/cloneDeep';

export const discoverSiteId = 53424024;

export const nonDiscoverPost = {
	site_ID: 1
};
export const discoverSiteFormat = {
	'site_ID': discoverSiteId,
	'discover_metadata': {
		'permalink': 'https://toutparmoi.com/',
		'attribution': {
			'author_name': 'toutparmoi',
			'author_url': 'https://toutparmoi.com/about/a-word-from-the-editor/',
			'blog_name': 'The Earl of Southampton\'s Cat',
			'blog_url': 'https://toutparmoi.com',
			'avatar_url': ''
		},
		'discover_fp_post_formats': [
			{
				'name': 'Pick',
				'slug': 'pick',
				'id': 346750
			},
			{
				'name': 'Site Pick',
				'slug': 'site-pick',
				'id': 308219249
			}
		],
		'featured_post_wpcom_data': {
			'blog_id': 79600288
		}
	}
};

export const discoverPost = {
	'site_ID': discoverSiteId,
	'discover_metadata': {
		'permalink': 'https://talkforeigntome.com/2016/07/17/my-mystery-malady/',
		'attribution': {
			'author_name': 'Ruth',
			'author_url': 'https://talkforeigntome.com/2016/07/17/my-mystery-malady/',
			'blog_name': 'Talk Foreign to Me',
			'blog_url': 'https://talkforeigntome.com',
			'avatar_url': 'https://2.gravatar.com/avatar/8eeb836f187d8b5b861bb035bcb18ed4?s=100&amp;d=https%3A%2F%2Fsecure.gravatar.com%2Fblavatar%2Fef751c856dccbacab2b97d7b14ca002b%3Fs%3D100%26d%3Dhttps%253A%252F%252Fs2.wp.com%252Fwp-content%252Fthemes%252Fh4%252Ftabs%252Fimages%252Fdefaultavatar.png&amp;r=G'
		},
		'discover_fp_post_formats': [
			{
				'name': 'Pick',
				'slug': 'pick',
				'id': 346750
			},
			{
				'name': 'Standard Pick',
				'slug': 'standard-pick',
				'id': 337879995
			}
		],
		'featured_post_wpcom_data': {
			'blog_id': 67377696,
			'post_id': 6876,
			'like_count': 33,
			'comment_count': 9
		}
	}
};

const externalPost = cloneDeep( discoverPost );
externalPost.discover_metadata.featured_post_wpcom_data = null;
export const externalDiscoverPost = externalPost;
