/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default [
	{
		attributes: {},
		supports: {
			inserter: false,
			html: false,
		},
		save: () => (
			<div className="wp-block-premium-content-subscriber-view">
				<InnerBlocks.Content />
			</div>
		),
	},
];
