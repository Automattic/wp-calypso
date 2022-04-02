type BlockProps = {
	url: string;
};

const blockLinks: Record< string, BlockProps > = {
	'core/template-part': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/template-part-block/',
	},
	'core/site-title': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-title-block/',
	},

	'core/site-tagline': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-tagline-block/',
	},

	'core/site-logo': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/site-logo-block/',
	},

	'core/page-list': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/page-list-block/',
	},

	'core/loginout': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/login-out-block/',
	},

	'core/video': { url: 'https://wordpress.com/support/wordpress-editor/blocks/video-block/' },

	'core/verse': { url: 'https://wordpress.com/support/wordpress-editor/blocks/verse-block/' },

	'core/spacer': { url: 'https://wordpress.com/support/wordpress-editor/blocks/spacer-block/' },

	'core/shortcode': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/shortcode-block/',
	},

	'core/separator': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/separator-block/',
	},

	'core/search': { url: 'https://wordpress.com/support/wordpress-editor/blocks/search-block/' },

	'core/rss': { url: 'https://wordpress.com/support/wordpress-editor/blocks/rss-block/' },

	'core/group': { url: 'https://wordpress.com/support/wordpress-editor/blocks/row-block/' },

	'core/block': { url: 'https://wordpress.com/support/wordpress-editor/blocks/reusable-block/' },

	'core/tag-cloud': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/tag-cloud-block/',
	},

	'core/quote': { url: 'https://wordpress.com/support/wordpress-editor/blocks/quote-block/' },

	'core/pullquote': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/pullquote-block/',
	},

	'core/preformatted': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/preformatted-block/',
	},

	'core/paragraph': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/paragraph-block/',
	},

	'core/more': { url: 'https://wordpress.com/support/wordpress-editor/blocks/more-block/' },

	'core/list': { url: 'https://wordpress.com/support/wordpress-editor/blocks/list-block/' },

	'core/latest-posts': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/latest-posts-block/',
	},

	'core/latest-comments': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/latest-comments-block/',
	},

	'core/heading': { url: 'https://wordpress.com/support/wordpress-editor/blocks/heading-block/' },

	'core/file': { url: 'https://wordpress.com/support/wordpress-editor/blocks/file-block/' },

	'core/embed': { url: 'https://wordpress.com/support/wordpress-editor/blocks/embed-block/' },

	'core/html': { url: 'https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/' },

	'core/code': { url: 'https://wordpress.com/support/wordpress-editor/blocks/code-block/' },

	'core/freeform': { url: 'https://wordpress.com/support/wordpress-editor/blocks/classic-block/' },

	'core/categories': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/categories-block/',
	},

	'core/calendar': { url: 'https://wordpress.com/support/wordpress-editor/blocks/calendar-block/' },

	'core/audio': { url: 'https://wordpress.com/support/wordpress-editor/blocks/audio-block/' },

	'core/archives': { url: 'https://wordpress.com/support/wordpress-editor/blocks/archives-block/' },

	'core/query': {
		url: 'https://wordpress.com/support/full-site-editing/theme-blocks/query-loop-block/',
	},

	'core/media-text': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/media-text-block/',
	},

	'core/table': { url: 'https://wordpress.com/support/wordpress-editor/blocks/table-block/' },

	'core/social-links': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/',
	},

	'core/columns': { url: 'https://wordpress.com/support/wordpress-editor/blocks/columns-block/' },

	'core/image': { url: 'https://wordpress.com/support/wordpress-editor/blocks/image-block/' },

	'core/cover': { url: 'https://wordpress.com/support/wordpress-editor/blocks/cover-block/' },

	'core/buttons': { url: 'https://wordpress.com/support/wordpress-editor/blocks/buttons-block/' },

	'core/gallery': { url: 'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/' },

	'syntaxhighlighter/code': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/syntax-highlighter-code-block/',
	},

	'crowdsignal-forms/vote': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/vote-block/',
	},

	'crowdsignal-forms/poll': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/poll-block/',
	},

	'crowdsignal-forms/nps': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/measure-nps-block/',
	},

	'crowdsignal-forms/feedback': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/feedback-button-block/',
	},

	'a8c/posts-carousel': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/posts-carousel-block/',
	},

	'premium-content/container': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',
	},

	'a8c/blog-posts': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/blog-posts-block/',
	},

	'jetpack/send-a-message': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/',
	},

	'jetpack/timeline': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/timeline-block/',
	},

	'jetpack/story': { url: 'https://wordpress.com/support/wordpress-editor/blocks/story-block/' },

	'jetpack/revue': { url: 'https://wordpress.com/support/wordpress-editor/blocks/revue-block/' },

	'jetpack/rating-star': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/ratings-block/',
	},

	'jetpack/related-posts': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/related-posts-block/',
	},

	'jetpack/repeat-visitor': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/repeat-visitor-block/',
	},

	'jetpack/podcast-player': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/podcast-player-block/',
	},

	'jetpack/opentable': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/opentable-block/',
	},

	'jetpack/map': { url: 'https://wordpress.com/support/wordpress-editor/blocks/map-block/' },

	'jetpack/image-compare': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/image-compare-block/',
	},

	'jetpack/gif': { url: 'https://wordpress.com/support/wordpress-editor/blocks/gif-block/' },

	'jetpack/event-countdown': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/event-countdown-block/',
	},

	'jetpack/donations': { url: 'https://wordpress.com/support/wordpress-editor/blocks/donations/' },

	'jetpack/calendly': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/',
	},

	'jetpack/business-hours': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/business-hours-block/',
	},

	'jetpack/wordads': { url: 'https://wordpress.com/support/wordpress-editor/blocks/ad-block/' },

	'jetpack/payments-intro': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/payments/',
	},

	'jetpack/contact-info': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/contact-info-block/',
	},

	'jetpack/tiled-gallery': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/tiled-gallery-block/',
	},

	'jetpack/slideshow': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/slideshow-block/',
	},

	'jetpack/subscriptions': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/subscription-form-block/',
	},

	'jetpack/contact-form': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/form-block/',
	},

	'jetpack/layout-grid': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/layout-grid-block/',
	},

	'jetpack/mailchimp': {
		url: 'https://wordpress.com/support/wordpress-editor/blocks/mailchimp-block/',
	},
};

export default blockLinks;
