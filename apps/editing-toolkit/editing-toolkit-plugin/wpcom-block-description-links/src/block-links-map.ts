const blockLinks: { [ key: string ]: string } = {
	/**
	 * Core Blocks
	 */
	'core/template-part':
		'https://wordpress.com/support/full-site-editing/theme-blocks/template-part-block/',
	'core/site-title':
		'https://wordpress.com/support/full-site-editing/theme-blocks/site-title-block/',

	'core/site-tagline':
		'https://wordpress.com/support/full-site-editing/theme-blocks/site-tagline-block/',

	'core/site-logo': 'https://wordpress.com/support/full-site-editing/theme-blocks/site-logo-block/',

	'core/page-list': 'https://wordpress.com/support/full-site-editing/theme-blocks/page-list-block/',

	'core/loginout': 'https://wordpress.com/support/full-site-editing/theme-blocks/login-out-block/',

	'core/video': 'https://wordpress.com/support/wordpress-editor/blocks/video-block/',

	'core/verse': 'https://wordpress.com/support/wordpress-editor/blocks/verse-block/',

	'core/spacer': 'https://wordpress.com/support/wordpress-editor/blocks/spacer-block/',

	'core/shortcode': 'https://wordpress.com/support/wordpress-editor/blocks/shortcode-block/',

	'core/separator': 'https://wordpress.com/support/wordpress-editor/blocks/separator-block/',

	'core/search': 'https://wordpress.com/support/wordpress-editor/blocks/search-block/',

	'core/rss': 'https://wordpress.com/support/wordpress-editor/blocks/rss-block/',

	'core/navigation': 'https://wordpress.com/support/site-editing/theme-blocks/navigation-block/',

	'core/tag-cloud': 'https://wordpress.com/support/wordpress-editor/blocks/tag-cloud-block/',

	'core/quote': 'https://wordpress.com/support/wordpress-editor/blocks/quote-block/',

	'core/pullquote': 'https://wordpress.com/support/wordpress-editor/blocks/pullquote-block/',

	'core/preformatted': 'https://wordpress.com/support/wordpress-editor/blocks/preformatted-block/',

	'core/paragraph': 'https://wordpress.com/support/wordpress-editor/blocks/paragraph-block/',

	'core/more': 'https://wordpress.com/support/wordpress-editor/blocks/more-block/',

	'core/list': 'https://wordpress.com/support/wordpress-editor/blocks/list-block/',

	'core/latest-posts': 'https://wordpress.com/support/wordpress-editor/blocks/latest-posts-block/',

	'core/latest-comments':
		'https://wordpress.com/support/wordpress-editor/blocks/latest-comments-block/',

	'core/heading': 'https://wordpress.com/support/wordpress-editor/blocks/heading-block/',

	'core/file': 'https://wordpress.com/support/wordpress-editor/blocks/file-block/',

	'core/embed': 'https://wordpress.com/support/wordpress-editor/blocks/embed-block/',

	'core/html': 'https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/',

	'core/code': 'https://wordpress.com/support/wordpress-editor/blocks/code-block/',

	'core/freeform': 'https://wordpress.com/support/wordpress-editor/blocks/classic-block/',

	'core/categories': 'https://wordpress.com/support/wordpress-editor/blocks/categories-block/',

	'core/calendar': 'https://wordpress.com/support/wordpress-editor/blocks/calendar-block/',

	'core/audio': 'https://wordpress.com/support/wordpress-editor/blocks/audio-block/',

	'core/archives': 'https://wordpress.com/support/wordpress-editor/blocks/archives-block/',

	'core/query': 'https://wordpress.com/support/full-site-editing/theme-blocks/query-loop-block/',

	'core/media-text': 'https://wordpress.com/support/wordpress-editor/blocks/media-text-block/',

	'core/table': 'https://wordpress.com/support/wordpress-editor/blocks/table-block/',

	'core/social-links': 'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/',

	'core/columns': 'https://wordpress.com/support/wordpress-editor/blocks/columns-block/',

	'core/image': 'https://wordpress.com/support/wordpress-editor/blocks/image-block/',

	'core/cover': 'https://wordpress.com/support/wordpress-editor/blocks/cover-block/',

	'core/buttons': 'https://wordpress.com/support/wordpress-editor/blocks/buttons-block/',

	'core/gallery': 'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/',

	'core/post-content':
		'https://wordpress.com/support/full-site-editing/theme-blocks/post-content-block/',

	'core/table-of-contents':
		'https://wordpress.com/support/wordpress-editor/table-of-contents-block/',

	'core/comments': 'https://wordpress.com/support/full-site-editing/theme-blocks/comments-block/',

	/**
	 * A8C and CO Blocks
	 */
	'syntaxhighlighter/code':
		'https://wordpress.com/support/wordpress-editor/blocks/syntax-highlighter-code-block/',

	'crowdsignal-forms/vote': 'https://wordpress.com/support/wordpress-editor/blocks/vote-block/',

	'crowdsignal-forms/poll': 'https://wordpress.com/support/wordpress-editor/blocks/poll-block/',

	'crowdsignal-forms/nps':
		'https://wordpress.com/support/wordpress-editor/blocks/measure-nps-block/',

	'crowdsignal-forms/feedback':
		'https://wordpress.com/support/wordpress-editor/blocks/feedback-button-block/',

	'a8c/posts-carousel':
		'https://wordpress.com/support/wordpress-editor/blocks/posts-carousel-block/',

	'premium-content/container':
		'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',

	'a8c/blog-posts': 'https://wordpress.com/support/wordpress-editor/blocks/blog-posts-block/',

	'jetpack/send-a-message':
		'https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/',

	/**
	 * Jetpack Blocks
	 */
	'jetpack/timeline': 'https://wordpress.com/support/wordpress-editor/blocks/timeline-block/',

	'jetpack/story': 'https://wordpress.com/support/wordpress-editor/blocks/story-block/',

	'jetpack/revue': 'https://wordpress.com/support/wordpress-editor/blocks/revue-block/',

	'jetpack/rating-star': 'https://wordpress.com/support/wordpress-editor/blocks/ratings-block/',

	'jetpack/related-posts':
		'https://wordpress.com/support/wordpress-editor/blocks/related-posts-block/',

	'jetpack/repeat-visitor':
		'https://wordpress.com/support/wordpress-editor/blocks/repeat-visitor-block/',

	'jetpack/podcast-player':
		'https://wordpress.com/support/wordpress-editor/blocks/podcast-player-block/',

	'jetpack/opentable': 'https://wordpress.com/support/wordpress-editor/blocks/opentable-block/',

	'jetpack/map': 'https://wordpress.com/support/wordpress-editor/blocks/map-block/',

	'jetpack/image-compare':
		'https://wordpress.com/support/wordpress-editor/blocks/image-compare-block/',

	'jetpack/gif': 'https://wordpress.com/support/wordpress-editor/blocks/gif-block/',

	'jetpack/event-countdown':
		'https://wordpress.com/support/wordpress-editor/blocks/event-countdown-block/',

	'jetpack/donations': 'https://wordpress.com/support/wordpress-editor/blocks/donations/',

	'jetpack/calendly': 'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/',

	'jetpack/business-hours':
		'https://wordpress.com/support/wordpress-editor/blocks/business-hours-block/',

	'jetpack/wordads': 'https://wordpress.com/support/wordpress-editor/blocks/ad-block/',

	'jetpack/payments-intro': 'https://wordpress.com/support/wordpress-editor/blocks/payments/',

	'jetpack/contact-info':
		'https://wordpress.com/support/wordpress-editor/blocks/contact-info-block/',

	'jetpack/tiled-gallery':
		'https://wordpress.com/support/wordpress-editor/blocks/tiled-gallery-block/',

	'jetpack/slideshow': 'https://wordpress.com/support/wordpress-editor/blocks/slideshow-block/',

	'jetpack/subscriptions':
		'https://wordpress.com/support/wordpress-editor/blocks/subscription-form-block/',

	'jetpack/contact-form': 'https://wordpress.com/support/wordpress-editor/blocks/form-block/',

	'jetpack/layout-grid': 'https://wordpress.com/support/wordpress-editor/blocks/layout-grid-block/',

	'jetpack/mailchimp': 'https://wordpress.com/support/wordpress-editor/blocks/mailchimp-block/',
};

export const blockLinksWithVariations: {
	[ key: string ]: { [ key: string ]: string };
} = {
	'core/group': {
		group: 'https://wordpress.com/support/wordpress-editor/blocks/group-block/',
		'group-row': 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
		'group-stack': 'https://wordpress.com/support/wordpress-editor/blocks/row-block/',
	},
};

export const childrenBlockLinksWithDifferentUrl: { [ key: string ]: string } = {
	/**
	 * Core Blocks
	 */
	'core/nextpage': 'https://wordpress.com/support/wordpress-editor/blocks/page-break-block/',
};

export default blockLinks;
