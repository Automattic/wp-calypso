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
