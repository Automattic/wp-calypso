import cloneDeep from 'lodash/cloneDeep';

export const original = [
	{
		'ID': 77203074,
		'name': 'Just You Wait',
		'description': 'Sweet little tests all in a Box',
		'URL': 'https://testonesite2014.wordpress.com',
		'jetpack': false,
		'post_count': 1,
		'slug': 'testonesite2014.wordpress.com',
		'subscribers_count': 1,
		'lang': 'en',
		'logo': {
			'id': 0,
			'sizes': [],
			'url': ''
		},
		'visible': true,
		'is_private': false,
		'is_following': false,
		'options': {
			'timezone': '',
			'gmt_offset': 0,
			'videopress_enabled': false,
			'upgraded_filetypes_enabled': false,
			'login_url': 'https://testonesite2014.wordpress.com/wp-login.php',
			'admin_url': 'https://testonesite2014.wordpress.com/wp-admin/',
			'is_mapped_domain': false,
			'is_redirect': false,
			'unmapped_url': 'https://testonesite2014.wordpress.com',
			'featured_images_enabled': false,
			'theme_slug': 'pub/penscratch',
			'header_image': {
				'attachment_id': 28,
				'url': 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg',
				'thumbnail_url': 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg',
				'height': 1280,
				'width': 850
			},
			'background_color': false,
			'image_default_link_type': 'file',
			'image_thumbnail_width': 150,
			'image_thumbnail_height': 150,
			'image_thumbnail_crop': 0,
			'image_medium_width': 300,
			'image_medium_height': 300,
			'image_large_width': 1024,
			'image_large_height': 1024,
			'permalink_structure': '/%year%/%monthnum%/%day%/%postname%/',
			'post_formats': [],
			'default_post_format': '0',
			'default_category': 1,
			'allowed_file_types': [
				'jpg',
				'jpeg',
				'png',
				'gif',
				'pdf',
				'doc',
				'ppt',
				'odt',
				'pptx',
				'docx',
				'pps',
				'ppsx',
				'xls',
				'xlsx',
				'key'
			],
			'show_on_front': 'posts',
			'default_likes_enabled': true,
			'default_sharing_status': true,
			'default_comment_status': true,
			'default_ping_status': true,
			'software_version': '4.4-alpha-33842',
			'created_at': '2014-10-18T17:14:52+00:00',
			'wordads': false,
			'publicize_permanently_disabled': false
		},
		'meta': {
			'links': {
				'self': 'https://public-api.wordpress.com/rest/v1.1/sites/77203074',
				'help': 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/help',
				'posts': 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/posts/',
				'comments': 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/comments/',
				'xmlrpc': 'https://testonesite2014.wordpress.com/xmlrpc.php'
			}
		},
		'user_can_manage': true
	},
	{
		'ID': 5601559,
		'name': 'a test blog',
		'description': '',
		'URL': 'http://gcbu.wordpress.com',
		'jetpack': false,
		'post_count': 132,
		'subscribers_count': 4,
		'lang': 'en',
		'visible': true,
		'is_private': false,
		'is_following': true,
		'options': {
			'timezone': '',
			'gmt_offset': 0,
			'videopress_enabled': false,
			'login_url': 'https://gcbu.wordpress.com/wp-login.php',
			'admin_url': 'https://gcbu.wordpress.com/wp-admin/',
			'featured_images_enabled': true,
			'header_image': {
				'attachment_id': 1238,
				'url': 'https://gcbu.files.wordpress.com/2014/05/cropped-20140530-182602-66362089.jpg',
				'thumbnail_url': 'https://gcbu.files.wordpress.com/2014/05/cropped-20140530-182602-66362089.jpg',
				'height': 239,
				'width': 1260
			},
			'image_default_link_type': 'file',
			'image_thumbnail_width': 150,
			'image_thumbnail_height': 150,
			'image_thumbnail_crop': 0,
			'image_medium_width': 300,
			'image_medium_height': 300,
			'image_large_width': 1024,
			'image_large_height': 1024,
			'post_formats': {
				'aside': 'Aside',
				'link': 'Link',
				'gallery': 'Gallery',
				'status': 'Status',
				'quote': 'Quote',
				'image': 'Image'
			},
			'default_likes_enabled': true,
			'default_sharing_status': true,
			'default_comment_status': true,
			'default_ping_status': true,
			'software_version': '4.0-beta2-20140728'
		},
		'meta': {
			'links': {
				'self': 'https://public-api.wordpress.com/rest/v1/sites/5601559',
				'help': 'https://public-api.wordpress.com/rest/v1/sites/5601559/help',
				'posts': 'https://public-api.wordpress.com/rest/v1/sites/5601559/posts/',
				'comments': 'https://public-api.wordpress.com/rest/v1/sites/5601559/comments/',
				'xmlrpc': 'https://gcbu.wordpress.com/xmlrpc.php'
			}
		},
		'user_can_manage': true,
		'is_previewable': true
	},
	{
		'ID': 54117,
		'name': 'Automattic',
		'description': 'Making it easy',
		'URL': 'http://automattic.com',
		'jetpack': false,
		'post_count': 14556,
		'subscribers_count': 5975,
		'lang': 'en',
		'icon': {
			'img': 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
			'ico': 'https://secure.gravatar.com/blavatar/662db33e9076ddbb8852ae35a845bfb4'
		},
		'visible': true,
		'is_private': false,
		'is_following': false,
		'options': {
			'timezone': '',
			'gmt_offset': 0,
			'videopress_enabled': false,
			'login_url': 'https://automattic.wordpress.com/wp-login.php',
			'admin_url': 'https://automattic.wordpress.com/wp-admin/',
			'featured_images_enabled': true,
			'header_image': false,
			'image_default_link_type': 'file',
			'image_thumbnail_width': 150,
			'image_thumbnail_height': 150,
			'image_thumbnail_crop': 0,
			'image_medium_width': 300,
			'image_medium_height': 300,
			'image_large_width': 1024,
			'image_large_height': 1024,
			'post_formats': {
				'aside': 'Aside',
				'link': 'Link',
				'gallery': 'Gallery',
				'status': 'Status',
				'quote': 'Quote',
				'image': 'Image'
			},
			'default_post_format': false,
			'default_likes_enabled': false,
			'default_sharing_status': true,
			'default_comment_status': false,
			'default_ping_status': false,
			'software_version': '4.0-beta2-20140728'
		},
		'meta': {
			'links': {
				'self': 'https://public-api.wordpress.com/rest/v1/sites/54117',
				'help': 'https://public-api.wordpress.com/rest/v1/sites/54117/help',
				'posts': 'https://public-api.wordpress.com/rest/v1/sites/54117/posts/',
				'comments': 'https://public-api.wordpress.com/rest/v1/sites/54117/comments/',
				'xmlrpc': 'https://automattic.wordpress.com/xmlrpc.php'
			}
		},
		'user_can_manage': true
	},
	{
		'ID': 3584907,
		'name': 'WordPress.com News',
		'description': 'The latest news on WordPress.com and the WordPress community.',
		'URL': 'http://en.blog.wordpress.com',
		'jetpack': false,
		'post_count': 1149,
		'subscribers_count': 12443980,
		'lang': 'en',
		'visible': true,
		'is_private': false,
		'is_following': true,
		'options': {
			'timezone': '',
			'gmt_offset': 0,
			'videopress_enabled': true,
			'login_url': 'https://wordpress.com/wp-login.php',
			'admin_url': 'https://en.blog.wordpress.com/wp-admin/',
			'featured_images_enabled': true,
			'header_image': false,
			'image_default_link_type': 'file',
			'image_thumbnail_width': 150,
			'image_thumbnail_height': 150,
			'image_thumbnail_crop': 0,
			'image_medium_width': 300,
			'image_medium_height': 300,
			'image_large_width': 1024,
			'image_large_height': 1024,
			'post_formats': {
				'aside': 'Aside',
				'link': 'Link',
				'gallery': 'Gallery',
				'status': 'Status',
				'quote': 'Quote',
				'image': 'Image'
			},
			'default_likes_enabled': true,
			'default_sharing_status': true,
			'default_comment_status': true,
			'default_ping_status': false,
			'software_version': '4.0-beta2-20140728'
		},
		'meta': {
			'links': {
				'self': 'https://public-api.wordpress.com/rest/v1/sites/3584907',
				'help': 'https://public-api.wordpress.com/rest/v1/sites/3584907/help',
				'posts': 'https://public-api.wordpress.com/rest/v1/sites/3584907/posts/',
				'comments': 'https://public-api.wordpress.com/rest/v1/sites/3584907/comments/',
				'xmlrpc': 'https://en.blog.wordpress.com/xmlrpc.php'
			}
		},
		'user_can_manage': true
	}
];

export const updated = cloneDeep( original );

updated[0].name = 'Checkout this new name';

updated.push( {
	'ID': 43889156,
	'name': 'bitswapping development',
	'description': 'Just another WordPress site',
	'URL': 'http://demo.bitswapping.com',
	'jetpack': true,
	'post_count': 3,
	'subscribers_count': 1,
	'lang': 'en',
	'visible': true,
	'is_private': false,
	'is_following': true,
	'options': {
		'timezone': '',
		'gmt_offset': 0,
		'videopress_enabled': false,
		'login_url': 'https://demo.bitswapping.com/wp-login.php',
		'admin_url': 'https://demo.bitswapping.com/wp-admin/',
		'featured_images_enabled': true,
		'header_image': false,
		'image_default_link_type': 'file',
		'image_thumbnail_width': 150,
		'image_thumbnail_height': 150,
		'image_thumbnail_crop': 0,
		'image_medium_width': 300,
		'image_medium_height': 300,
		'image_large_width': 1024,
		'image_large_height': 1024,
		'post_formats': {
			'aside': 'Aside',
			'link': 'Link',
			'gallery': 'Gallery',
			'status': 'Status',
			'quote': 'Quote',
			'image': 'Image'
		},
		'default_likes_enabled': true,
		'default_sharing_status': false,
		'default_comment_status': true,
		'default_ping_status': true,
		'software_version': '4.0-beta2-20140728'
	},
	'meta': {
		'links': {
			'self': 'https://public-api.wordpress.com/rest/v1/sites/43889156',
			'help': 'https://public-api.wordpress.com/rest/v1/sites/43889156/help',
			'posts': 'https://public-api.wordpress.com/rest/v1/sites/43889156/posts/',
			'comments': 'https://public-api.wordpress.com/rest/v1/sites/43889156/comments/',
			'xmlrpc': 'https://demo.bitswapping.com/xmlrpc.php'
		}
	},
	'user_can_manage': true
} );
