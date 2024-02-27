/* URLs are localized within the function where these URLs are used. */
/* eslint-disable wpcalypso/i18n-unlocalized-url */
const blockInfoMapping: { [ key: string ]: { link: string; postId: number } } = {
	/**
	 * Core Blocks
	 */
	'core/template-part': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/template-part-block/',
		postId: 192398,
	},
	'core/site-title': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-title-block/',
		postId: 184569,
	},
	'core/site-tagline': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-tagline-block/',
		postId: 184553,
	},
	'core/site-logo': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-logo-block/',
		postId: 184537,
	},
	'core/page-list': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/page-list-block/',
		postId: 180696,
	},
	'core/loginout': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/login-out-block/',
		postId: 184610,
	},
	'core/video': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/video-block/',
		postId: 149045,
	},
	'core/verse': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/verse-block/',
		postId: 149992,
	},
	'core/spacer': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/spacer-block/',
		postId: 148996,
	},
	'core/shortcode': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/shortcode-block/',
		postId: 149209,
	},
	'core/separator': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/separator-block/',
		postId: 149012,
	},
	'core/search': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/search-block/',
		postId: 187104,
	},
	'core/rss': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/rss-block/',
		postId: 174794,
	},
	'core/navigation': {
		link: 'https://wordpress.com/support/site-editing/theme-blocks/navigation-block/',
		postId: 162159,
	},
	'core/tag-cloud': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/tag-cloud-block/',
		postId: 188957,
	},
	'core/quote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/quote-block/',
		postId: 148575,
	},
	'core/pullquote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/pullquote-block/',
		postId: 149344,
	},
	'core/preformatted': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/preformatted-block/',
		postId: 149339,
	},
	'core/more': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/more-block/',
		postId: 148614,
	},
	'core/list': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/list-block/',
		postId: 148563,
	},
	'core/latest-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/latest-posts-block/',
		postId: 149818,
	},
	'core/latest-comments': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/latest-comments-block/',
		postId: 149811,
	},
	'core/heading': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/heading-block/',
		postId: 148403,
	},
	'core/file': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/file-block/',
		postId: 148586,
	},
	'core/embed': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/embed-block/',
		postId: 150644,
	},
	'core/html': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/',
		postId: 149059,
	},
	'core/code': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/code-block/',
		postId: 149042,
	},
	'core/freeform': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/classic-block/',
		postId: 149026,
	},
	'core/categories': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/categories-block/',
		postId: 149793,
	},
	'core/calendar': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/calendar-block/',
		postId: 171935,
	},
	'core/audio': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/audio-block/',
		postId: 148670,
	},
	'core/archives': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/archives-block/',
		postId: 149225,
	},
	'core/query': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/query-loop-block/',
		postId: 184188,
	},
	'core/media-text': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/media-text-block/',
		postId: 151100,
	},
	'core/table': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/table-block/',
		postId: 149666,
	},
	'core/social-links': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/',
		postId: 159466,
	},
	'core/columns': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/columns-block/',
		postId: 149073,
	},
	'core/image': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/image-block/',
		postId: 148378,
	},
	'core/cover': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/cover-block/',
		postId: 148675,
	},
	'core/buttons': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/buttons-block/',
		postId: 162116,
	},
	'core/gallery': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/',
		postId: 148667,
	},
	'core/post-content': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/post-content-block/',
		postId: 216265,
	},
	'core/table-of-contents': {
		link: 'https://wordpress.com/support/wordpress-editor/table-of-contents-block/',
		postId: 201571,
	},
	'core/comments': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/comments-block/',
		postId: 218903,
	},
	'core/post-time-to-read': {
		link: 'https://wordpress.com/support/site-editing/theme-blocks/time-to-read-block',
		postId: 243241,
	},
	'syntaxhighlighter/code': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/syntax-highlighter-code-block/',
		postId: 4743,
	},
	'crowdsignal-forms/vote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/vote-block/',
		postId: 174824,
	},
	'crowdsignal-forms/poll': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/poll-block/',
		postId: 170183,
	},
	'crowdsignal-forms/nps': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/measure-nps-block/',
		postId: 182393,
	},
	'crowdsignal-forms/feedback': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/feedback-button-block/',
		postId: 183578,
	},
	'a8c/posts-carousel': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/posts-carousel-block/',
		postId: 166417,
	},
	'premium-content/container': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',
		postId: 243475,
	},
	'a8c/blog-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/blog-posts-block/',
		postId: 158419,
	},
	'jetpack/send-a-message': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/',
		postId: 169728,
	},
	'jetpack/blogroll': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/blogroll-block/',
		postId: 291406,
	},
	'jetpack/timeline': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/timeline-block/',
		postId: 158453,
	},
	'jetpack/story': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/story-block/',
		postId: 176320,
	},
	'jetpack/revue': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/revue-block/',
		postId: 67810,
	},
	'jetpack/rating-star': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/ratings-block/',
		postId: 158224,
	},
	'jetpack/related-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/related-posts-block/',
		postId: 1545,
	},
	'jetpack/repeat-visitor': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/repeat-visitor-block/',
		postId: 154471,
	},
	'jetpack/podcast-player': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/podcast-player-block/',
		postId: 163160,
	},
	'jetpack/opentable': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/opentable-block/',
		postId: 162208,
	},
	'jetpack/map': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/map-block/',
		postId: 149684,
	},
	'jetpack/image-compare': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/image-compare-block/',
		postId: 168169,
	},
	'jetpack/gif': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/gif-block/',
		postId: 174810,
	},
	'jetpack/event-countdown': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/event-countdown-block/',
		postId: 159246,
	},
	'jetpack/donations': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/donations/',
		postId: 171110,
	},
	'jetpack/calendly': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/',
		postId: 162199,
	},
	'jetpack/business-hours': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/business-hours-block/',
		postId: 173136,
	},
	'jetpack/wordads': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/ad-block/',
		postId: 190916,
	},
	'jetpack/payments-intro': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/payments/',
		postId: 169123,
	},
	'jetpack/contact-info': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/contact-info-block/',
		postId: 186162,
	},
	'jetpack/tiled-gallery': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/tiled-gallery-block/',
		postId: 150746,
	},
	'jetpack/slideshow': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/slideshow-block/',
		postId: 157055,
	},
	'jetpack/subscriptions': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/subscription-form-block/',
		postId: 170164,
	},
	'jetpack/contact-form': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/form-block/',
		postId: 168307,
	},
	'jetpack/layout-grid': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/layout-grid-block/',
		postId: 160172,
	},
	'jetpack/mailchimp': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/mailchimp-block/',
		postId: 152657,
	},
	'jetpack/paywall': {
		link: 'https://wordpress.com/support/paid-newsletters/#use-the-paywall-block',
		postId: 168381,
	},
	'jetpack/sharing-buttons': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/sharing-buttons-block/',
		postId: 330003,
	},
	'jetpack/like': {
		link: 'https://wordpress.com/support/likes/',
		postId: 7294,
	},
};

export const blockInfoWithVariations: {
	[ key: string ]: { [ key: string ]: { link: string; postId: number } };
} = {
	'core/group': {
		group: {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/group-block/',
			postId: 161882,
		},
		'group-row': {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
			postId: 190036,
		},
		'group-stack': {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
			postId: 190036,
		},
	},
};

export const childrenBlockInfoWithDifferentUrl: {
	[ key: string ]: { link: string; postId: number };
} = {
	/**
	 * Core Blocks
	 */
	'core/nextpage': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/page-break-block/',
		postId: 149374,
	},
};

export default blockInfoMapping;
