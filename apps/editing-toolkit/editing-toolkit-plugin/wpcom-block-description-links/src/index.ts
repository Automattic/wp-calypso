import { addFilter } from '@wordpress/hooks';
import { ReactElement } from 'react';
import { inlineBlockDescriptionLink } from './inline-block-link';

const addBlockSupportLinks = (
	settings: {
		[ key: string ]: string | ReactElement;
	},
	name: string
) => {
	// If block has a parent, use the parents name in the switch. This will apply the link to all nested blocks.
	const isChild = settings[ 'parent' ];
	const blockName = isChild ? settings[ 'parent' ].toString() : name;

	switch ( blockName ) {
		/**
		 * Core Blocks
		 */
		case 'core/template-part':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/template-part-block/'
			);
			break;

		case 'core/site-title':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/site-title-block/'
			);
			break;

		case 'core/site-tagline':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/site-tagline-block/'
			);
			break;

		case 'core/site-logo':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/site-logo-block/'
			);
			break;

		case 'core/page-list':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/page-list-block/'
			);
			break;

		case 'core/loginout':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/login-out-block/'
			);
			break;

		case 'core/video':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/video-block/'
			);
			break;

		case 'core/verse':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/verse-block/'
			);
			break;

		case 'core/spacer':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/spacer-block/'
			);
			break;

		case 'core/shortcode':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/shortcode-block/'
			);
			break;

		case 'core/separator':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/separator-block/'
			);
			break;

		case 'core/search':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/search-block/'
			);
			break;

		case 'core/rss':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/rss-block/'
			);
			break;

		case 'core/group':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/row-block/'
			);
			break;

		case 'core/block':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/reusable-block/'
			);
			break;

		case 'core/tag-cloud':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/tag-cloud-block/'
			);
			break;

		case 'core/quote':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/quote-block/'
			);
			break;

		case 'core/pullquote':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/pullquote-block/'
			);
			break;

		case 'core/preformatted':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/preformatted-block/'
			);
			break;

		case 'core/paragraph':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/paragraph-block/'
			);
			break;

		case 'core/more':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/more-block/'
			);
			break;

		case 'core/list':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/list-block/'
			);
			break;

		case 'core/latest-posts':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/latest-posts-block/'
			);
			break;

		case 'core/latest-comments':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/latest-comments-block/'
			);
			break;

		case 'core/heading':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/heading-block/'
			);
			break;

		case 'core/file':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/file-block/'
			);
			break;

		case 'core/embed':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/embed-block/'
			);
			break;

		case 'core/html':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/'
			);
			break;

		case 'core/code':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/code-block/'
			);
			break;

		case 'core/freeform':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/classic-block/'
			);
			break;

		case 'core/categories':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/categories-block/'
			);
			break;

		case 'core/calendar':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/calendar-block/'
			);
			break;

		case 'core/audio':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/audio-block/'
			);
			break;

		case 'core/archives':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/archives-block/'
			);
			break;

		case 'core/query':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/full-site-editing/theme-blocks/query-loop-block/'
			);
			break;

		case 'core/media-text':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/media-text-block/'
			);
			break;

		case 'core/table':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/table-block/'
			);
			break;

		case 'core/social-links':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/'
			);
			break;

		case 'core/columns':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/columns-block/'
			);
			break;

		case 'core/image':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/image-block/'
			);
			break;

		case 'core/cover':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/cover-block/'
			);
			break;

		case 'core/buttons':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/buttons-block/'
			);
			break;

		case 'core/gallery':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/'
			);
			break;

		/**
		 * A8C Blocks
		 */
		case 'syntaxhighlighter/code':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/syntax-highlighter-code-block/'
			);
			break;

		case 'crowdsignal-forms/vote':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/vote-block/'
			);
			break;

		case 'crowdsignal-forms/poll':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/poll-block/'
			);
			break;

		case 'crowdsignal-forms/nps':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/measure-nps-block/'
			);
			break;

		case 'crowdsignal-forms/feedback':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/feedback-button-block/'
			);
			break;

		case 'a8c/posts-carousel':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/posts-carousel-block/'
			);
			break;

		case 'premium-content/container':
		case 'premium-content/subscriber-view':
		case 'premium-content/logged-out-view':
		case 'premium-content/buttons':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/'
			);
			break;

		case 'a8c/blog-posts':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/blog-posts-block/'
			);
			break;

		/**
		 * Jetpack Blocks
		 */
		case 'jetpack/send-a-message':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/'
			);
			break;

		case 'jetpack/timeline':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/timeline-block/'
			);
			break;

		case 'jetpack/story':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/story-block/'
			);
			break;

		case 'jetpack/revue':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/revue-block/'
			);
			break;

		case 'jetpack/rating-star':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/ratings-block/'
			);
			break;

		case 'jetpack/related-posts':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/related-posts-block/'
			);
			break;

		case 'jetpack/repeat-visitor':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/repeat-visitor-block/'
			);
			break;

		case 'jetpack/podcast-player':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/podcast-player-block/'
			);
			break;

		case 'jetpack/opentable':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/opentable-block/'
			);
			break;

		case 'jetpack/map':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/map-block/'
			);
			break;

		case 'jetpack/image-compare':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/image-compare-block/'
			);
			break;

		case 'jetpack/gif':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/gif-block/'
			);
			break;

		case 'jetpack/event-countdown':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/event-countdown-block/'
			);
			break;

		case 'jetpack/donations':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/donations/'
			);
			break;

		case 'jetpack/calendly':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/'
			);
			break;

		case 'jetpack/business-hours':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/business-hours-block/'
			);
			break;

		case 'jetpack/wordads':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/ad-block/'
			);
			break;

		case 'jetpack/payments-intro':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/payments/'
			);
			break;

		case 'jetpack/contact-info':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/contact-info-block/'
			);
			break;

		case 'jetpack/tiled-gallery':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/tiled-gallery-block/'
			);
			break;

		case 'jetpack/slideshow':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/slideshow-block/'
			);
			break;

		case 'jetpack/subscriptions':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				'Allow readers to receive a newsletter with future posts in their inbox. Subscribers can get notifications through email or the Reader app.',
				'https://wordpress.com/support/wordpress-editor/blocks/subscription-form-block/'
			);
			break;

		case 'jetpack/contact-form':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/form-block/'
			);
			break;

		case 'jetpack/layout-grid':
		case 'jetpack/layout-grid-column':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/layout-grid-block/'
			);
			break;

		case 'jetpack/mailchimp':
			settings[ 'description' ] = inlineBlockDescriptionLink(
				settings[ 'description' ],
				'https://wordpress.com/support/wordpress-editor/blocks/mailchimp-block/'
			);
			break;
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/add-block-support-link',
	addBlockSupportLinks
);
