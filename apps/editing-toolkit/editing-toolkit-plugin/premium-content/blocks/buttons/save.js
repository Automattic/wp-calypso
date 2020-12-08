/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="wp-block-buttons">
			<InnerBlocks.Content />
		</div>
	);
}
