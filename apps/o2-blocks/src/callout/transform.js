import { createBlock } from '@wordpress/blocks';

/**
 * Transforms for the callout block.
 * Supports both prefix transforms ('/callout') and block transforms from paragraphs.
 */
export const transforms = {
	from: [
		{
			type: 'prefix',
			prefix: '/callout',
			/**
			 * Transform function for prefix-based callout creation.
			 * @returns {Object} The created callout block.
			 */
			transform() {
				return createBlock( 'a8c/callout' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			/**
			 * Transform function from paragraph blocks.
			 * @param {Object} attributes - The paragraph block attributes.
			 * @param {string} attributes.content - The paragraph content.
			 * @returns {Object|null} The created callout block or null if transform doesn't apply.
			 */
			transform( { content } ) {
				// Validate content exists and starts with /callout
				if ( ! content || typeof content !== 'string' ) {
					return null;
				}

				const trimmedContent = content.trim();
				if ( ! trimmedContent.startsWith( '/callout' ) ) {
					return null;
				}

				return createBlock( 'a8c/callout' );
			},
		},
	],
};
