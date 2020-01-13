/**
 * Internal dependencies
 */

import plugins from './plugins';

export default {
	ID: 91234567890,
	URL: 'http://example.com/site1',
	canUpdateFiles: true,
	capabilities: {
		manage_options: true,
	},
	description: 'Just another Sandbox Sites site',
	domain: 'http://example.com/site1',
	hasJetpackProtect: true,
	icon: {},
	is_following: false,
	is_private: false,
	jetpack: true,
	lang: 'en',
	logo: {},
	meta: {},
	name: 'Site 1',
	options: {
		admin_url: 'http://example.com/site2/wp-admin/',
		allowed_file_types: [],
		background_color: false,
		created_at: '2014-11-18T23:38:35+00:00',
		default_comment_status: true,
		default_likes_enabled: true,
		default_ping_status: true,
		default_sharing_status: false,
		featured_images_enabled: false,
		gmt_offset: 0,
		header_image: false,
		image_default_link_type: 'file',
		image_large_height: 1024,
		image_large_width: 1024,
		image_medium_height: 300,
		image_medium_width: 300,
		image_thumbnail_crop: 0,
		image_thumbnail_height: 150,
		image_thumbnail_width: 150,
		is_mapped_domain: true,
		is_multi_network: false,
		is_multi_site: true,
		is_redirect: false,
		jetpack_version: '3.7.0-dev',
		login_url: 'http://example.com/site2/wp-login.php',
		main_network_site: 'http://example.com',
		permalink_structure: '/%year%/%monthnum%/%day%/%postname%/',
		post_formats: [],
		show_on_front: 'posts',
		software_version: '4.2-RC4-32277',
		theme_slug: 'twentyfifteen',
		timezone: '',
		unmapped_url: 'http://example.com/site2',
		upgraded_filetypes_enabled: true,
		videopress_enabled: false,
	},
	plan: 1,
	plugins: plugins,
	post_count: 5,
	single_user_site: true,
	slug: 'example.com::site1',
	subscribers_count: 0,
	title: 'Site 1',
	update: {},
	jp_version: '3.7',
	user_can_manage: true,
	visible: true,
	wpcom_url: 'example.com/site1',
};
