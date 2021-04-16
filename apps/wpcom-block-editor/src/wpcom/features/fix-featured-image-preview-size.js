/**
 * WordPress dependencies
 */

import { addFilter } from '@wordpress/hooks';

// Use the `medium` size for the Featured Image media instead of the fallback
// `thumbnail` size, since that's too small for the preview.
// See https://github.com/Automattic/wp-calypso/issues/52010 for more context.
function fixFeaturedImagePreviewSize() {
	const withImageSize = function () {
		return 'medium';
	};
	addFilter(
		'editor.PostFeaturedImage.imageSize',
		'a8c/wpcom-block-editor/fixFeaturedImagePreviewSize',
		withImageSize
	);
}

fixFeaturedImagePreviewSize();
