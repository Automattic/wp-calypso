/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { unstable__bootstrapServerSideBlockDefinitions } from '@wordpress/blocks';

export const registerServerBlocksAttributes = () => {
	const blocks = {
		'core/latest-comments': {
			attributes: {
				className: { type: 'string' },
				commentsToShow: {
					type: 'number',
					default: 5,
					minimum: 1,
					maximum: 100,
				},
				displayAvatar: {
					type: 'boolean',
					default: true,
				},
				displayDate: {
					type: 'boolean',
					default: true,
				},
				displayExcerpt: {
					type: 'boolean',
					default: true,
				},
				align: {
					type: 'string',
				},
			},
		},
	};
	unstable__bootstrapServerSideBlockDefinitions( blocks );
};

export default registerServerBlocksAttributes;
