/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default {
	attributes: {},
	supports: {
		inserter: false,
		html: false,
	},
	save: () => (
		<div className="wp-block-premium-content-logged-out-view">
			<InnerBlocks.Content />
		</div>
	),
};
