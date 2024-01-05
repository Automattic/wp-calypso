/* URLs are localized within the function where these URLs are used. */
/* eslint-disable wpcalypso/i18n-unlocalized-url */
const blockInfoMapping: { [ key: string ]: { link: string; ID: number } } = {
	/**
	 * Core Blocks
	 */
	'core/template-part': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/template-part-block/',
		ID: 192398,
	},
	'core/site-title': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-title-block/',
		ID: 184569,
	},
	'core/site-tagline': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-tagline-block/',
		ID: 184553,
	},
	'core/site-logo': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-logo-block/',
		ID: 184537,
	},
	'core/page-list': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/page-list-block/',
		ID: 180696,
	},
	'core/loginout': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/login-out-block/',
		ID: 184610,
	},
	'core/video': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/video-block/',
		ID: 149045,
	},
	'core/verse': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/verse-block/',
		ID: 149992,
	},
	'core/spacer': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/spacer-block/',
		ID: 148996,
	},
	'core/shortcode': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/shortcode-block/',
		ID: 149209,
	},
	'core/separator': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/separator-block/',
		ID: 149012,
	},
	'core/search': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/search-block/',
		ID: 187104,
	},
	'core/rss': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/rss-block/',
		ID: 174794,
	},
	'core/navigation': {
		link: 'https://wordpress.com/support/site-editing/theme-blocks/navigation-block/',
		ID: 162159,
	},
	'core/tag-cloud': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/tag-cloud-block/',
		ID: 188957,
	},
	'core/quote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/quote-block/',
		ID: 148575,
	},
	'core/pullquote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/pullquote-block/',
		ID: 149344,
	},
	'core/preformatted': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/preformatted-block/',
		ID: 149339,
	},
	'core/paragraph': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/paragraph-block/',
		ID: 148375,
	},
	'core/more': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/more-block/',
		ID: 148614,
	},
	'core/list': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/list-block/',
		ID: 148563,
	},
	'core/latest-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/latest-posts-block/',
		ID: 149818,
	},
	'core/latest-comments': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/latest-comments-block/',
		ID: 149811,
	},
	'core/heading': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/heading-block/',
		ID: 148403,
	},
	'core/file': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/file-block/',
		ID: 148586,
	},
	'core/embed': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/embed-block/',
		ID: 150644,
	},
	'core/html': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/',
		ID: 149059,
	},
	'core/code': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/code-block/',
		ID: 149042,
	},
	'core/freeform': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/classic-block/',
		ID: 149026,
	},
	'core/categories': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/categories-block/',
		ID: 149793,
	},
	'core/calendar': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/calendar-block/',
		ID: 171935,
	},
	'core/audio': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/audio-block/',
		ID: 148670,
	},
	'core/archives': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/archives-block/',
		ID: 149225,
	},
	'core/query': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/query-loop-block/',
		ID: 184188,
	},
	'core/media-text': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/media-text-block/',
		ID: 151100,
	},
	'core/table': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/table-block/',
		ID: 149666,
	},
	'core/social-links': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/',
		ID: 159466,
	},
	'core/columns': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/columns-block/',
		ID: 149073,
	},
	'core/image': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/image-block/',
		ID: 148378,
	},
	'core/cover': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/cover-block/',
		ID: 148675,
	},
	'core/buttons': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/buttons-block/',
		ID: 162116,
	},
	'core/gallery': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/',
		ID: 148667,
	},
	'core/post-content': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/post-content-block/',
		ID: 216265,
	},
	'core/table-of-contents': {
		link: 'https://wordpress.com/support/wordpress-editor/table-of-contents-block/',
		ID: 201571,
	},
	'core/comments': {
		link: 'https://wordpress.com/support/full-site-editing/theme-blocks/comments-block/',
		ID: 218903,
	},
	'core/post-time-to-read': {
		link: 'https://wordpress.com/support/site-editing/theme-blocks/time-to-read-block',
		ID: 243241,
	},
	'syntaxhighlighter/code': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/syntax-highlighter-code-block/',
		ID: 4743,
	},
	'crowdsignal-forms/vote': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/vote-block/',
		ID: 174824,
	},
	'crowdsignal-forms/poll': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/poll-block/',
		ID: 170183,
	},
	'crowdsignal-forms/nps': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/measure-nps-block/',
		ID: 182393,
	},
	'crowdsignal-forms/feedback': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/feedback-button-block/',
		ID: 183578,
	},
	'a8c/posts-carousel': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/posts-carousel-block/',
		ID: 166417,
	},
	'premium-content/container': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',
		ID: 243475,
	},
	'a8c/blog-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/blog-posts-block/',
		ID: 158419,
	},
	'jetpack/send-a-message': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/',
		ID: 169728,
	},
	'jetpack/blogroll': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/blogroll-block/',
		ID: 291406,
	},
	'jetpack/timeline': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/timeline-block/',
		ID: 158453,
	},
	'jetpack/story': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/story-block/',
		ID: 176320,
	},
	'jetpack/revue': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/revue-block/',
		ID: 67810,
	},
	'jetpack/rating-star': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/ratings-block/',
		ID: 158224,
	},
	'jetpack/related-posts': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/related-posts-block/',
		ID: 1545,
	},
	'jetpack/repeat-visitor': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/repeat-visitor-block/',
		ID: 154471,
	},
	'jetpack/podcast-player': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/podcast-player-block/',
		ID: 163160,
	},
	'jetpack/opentable': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/opentable-block/',
		ID: 162208,
	},
	'jetpack/map': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/map-block/',
		ID: 149684,
	},
	'jetpack/image-compare': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/image-compare-block/',
		ID: 168169,
	},
	'jetpack/gif': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/gif-block/',
		ID: 174810,
	},
	'jetpack/event-countdown': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/event-countdown-block/',
		ID: 159246,
	},
	'jetpack/donations': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/donations/',
		ID: 171110,
	},
	'jetpack/calendly': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/',
		ID: 162199,
	},
	'jetpack/business-hours': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/business-hours-block/',
		ID: 173136,
	},
	'jetpack/wordads': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/ad-block/',
		ID: 190916,
	},
	'jetpack/payments-intro': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/payments/',
		ID: 169123,
	},
	'jetpack/contact-info': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/contact-info-block/',
		ID: 186162,
	},
	'jetpack/tiled-gallery': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/tiled-gallery-block/',
		ID: 150746,
	},
	'jetpack/slideshow': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/slideshow-block/',
		ID: 157055,
	},
	'jetpack/subscriptions': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/subscription-form-block/',
		ID: 170164,
	},
	'jetpack/contact-form': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/form-block/',
		ID: 168307,
	},
	'jetpack/layout-grid': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/layout-grid-block/',
		ID: 160172,
	},
	'jetpack/mailchimp': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/mailchimp-block/',
		ID: 152657,
	},
	'jetpack/paywall': {
		link: 'https://wordpress.com/support/paid-newsletters/#use-the-paywall-block',
		ID: 168381,
	},
};

export const blockInfoWithVariations: {
	[ key: string ]: { [ key: string ]: { link: string; ID: number } };
} = {
	'core/group': {
		group: {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/group-block/',
			ID: 161882,
		},
		'group-row': {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
			ID: 190036,
		},
		'group-stack': {
			link: 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
			ID: 190036,
		},
	},
};

export const childrenBlockInfoWithDifferentUrl: {
	[ key: string ]: { link: string; ID: number };
} = {
	/**
	 * Core Blocks
	 */
	'core/nextpage': {
		link: 'https://wordpress.com/support/wordpress-editor/blocks/page-break-block/',
		ID: 149374,
	},
};

export default blockInfoMapping;
