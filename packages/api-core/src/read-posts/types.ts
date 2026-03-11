import type { Railcar } from '@automattic/calypso-analytics';

interface ReaderPostMetaLinks {
	self: string;
	help: string;
	site: string;
}

interface ReaderPostTag {
	ID: number;
	name: string;
	slug: string;
	description: string;
	post_count: number;
	meta: {
		links: ReaderPostMetaLinks;
	};
	display_name: string;
}

interface ReaderPostCategory {
	ID: number;
	name: string;
	slug: string;
	description: string;
	post_count: number;
	parent: number;
	meta: {
		links: ReaderPostMetaLinks;
	};
}

interface ReaderPostAttachmentExif {
	aperture: string;
	credit: string;
	camera: string;
	caption: string;
	created_timestamp: string;
	copyright: string;
	focal_length: string;
	iso: string;
	shutter_speed: string;
	title: string;
	orientation: string;
	keywords: string[];
}

interface ReaderPostAttachment {
	ID: number;
	URL: string;
	guid: string;
	date: string;
	post_ID: number;
	author_ID: number;
	file: string;
	mime_type: string;
	extension: string;
	title: string;
	caption: string;
	description: string;
	alt: string;
	thumbnails: Record< string, string >;
	height: number;
	width: number;
	exif: ReaderPostAttachmentExif;
	meta: {
		links: ReaderPostMetaLinks & {
			parent: string;
		};
	};
}

interface ReaderPostAuthor {
	ID: number;
	login: string;
	email: boolean | string | null;
	name: string;
	first_name: string;
	last_name: string;
	nice_name: string;
	URL: string;
	avatar_URL: string;
	profile_URL: string;
	site_ID: number;
	has_avatar: boolean;
	wpcom_id: number;
	wpcom_login: string;
}

interface ReaderPostDiscussion {
	comments_open: boolean;
	comment_status: string;
	pings_open: boolean;
	ping_status: string;
	comment_count: number;
}

interface ReaderPostCapabilities {
	publish_post: boolean;
	delete_post: boolean;
	edit_post: boolean;
}

interface ReaderPostSiteIcon {
	img: string;
	ico: string;
}

interface ReaderPostFeaturedMedia {
	uri: string;
	width: number;
	height: number;
	type: string;
}

export interface ReaderPost {
	ID: number;
	site_ID: number;
	author: ReaderPostAuthor;
	date: string;
	modified: string;
	title: string;
	URL: string;
	short_URL: string;
	content: string;
	excerpt: string;
	slug: string;
	guid: string;
	status: string;
	discussion: ReaderPostDiscussion;
	likes_enabled: boolean;
	sharing_enabled: boolean;
	like_count: number;
	i_like: boolean;
	is_reblogged: boolean;
	is_following: boolean;
	global_ID: string;
	featured_image: string;
	post_thumbnail: {
		ID: number;
		URL: string;
		guid: string;
		mime_type: string;
		width: number;
		height: number;
	};
	format: string;
	tags: Record< string, ReaderPostTag >;
	categories: Record< string, ReaderPostCategory >;
	attachments: Record< string, ReaderPostAttachment >;
	attachment_count: number;
	metadata: unknown[];
	meta: {
		links: ReaderPostMetaLinks & {
			replies: string;
			likes: string;
		};
	};
	feed_ID: number;
	feed_URL: string;
	pseudo_ID: string;
	is_external: boolean;
	site_name: string;
	site_URL: string;
	site_is_private: boolean;
	site_icon: ReaderPostSiteIcon;
	featured_media: ReaderPostFeaturedMedia;
	is_subscribed_comments: boolean;
	can_subscribe_comments: boolean;
	subscribed_comments_notifications: boolean;
	publish_date_changed: boolean;
	use_excerpt: boolean;
	capabilities: ReaderPostCapabilities;
	is_jetpack: boolean;
	feed_item_ID: number;
	word_count: number;
	views: string;
	is_following_conversation: boolean;
	railcar?: Railcar;
	_should_reload?: boolean;
	is_error?: boolean;
}
