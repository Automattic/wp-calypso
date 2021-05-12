/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

const wordpress = {
	url: 'https://wordpress.com/post/<SITE_SLUG>?url=<URL>&title=<TITLE>&text=&v=5',
	windowArg: 'width=600,height=570,toolbar=0,resizeable,scrollbars,status',
};

const facebook = {
	url: `https://www.facebook.com/sharer.php?u=<URL>&p[title]=<TITLE>app_id=${ config(
		'facebook_api_key'
	) }`,
	windowArg: 'width=626,height=436,resizeable,scrollbars',
};

const twitter = {
	url: 'https://twitter.com/intent/tweet?url=<URL>&text=<TITLE>&via=wordpressdotcom',
	windowArg: 'width=550,height=420,resizeable,scrollbars',
};

const linkedin = {
	url: 'https://www.linkedin.com/shareArticle?mini=true&url=<URL>&title=<TITLE>',
};

const tumblr = {
	url:
		'https://www.tumblr.com/widgets/share/tool?canonicalUrl=<URL>&title=<TITLE>&caption=<DESCRIPTION>',
};

const pinterest = {
	url: 'https://pinterest.com/pin/create/button/?url=<URL>&description=<TITLE>',
};

const telegram = {
	url: 'https://telegram.me/share/url?url=<URL>&text=<TITLE>',
};

export default {
	wordpress,
	facebook,
	twitter,
	linkedin,
	tumblr,
	pinterest,
	telegram,
};
