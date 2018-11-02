/** @format */

/**
 * External dependencies
 */
import { unregisterBlockType } from '@wordpress/blocks';

// List of Core blocks that can't be enabled on WP.com (e.g for security reasons).
// We'll have to provide A8C custom versions of these blocks.
export const WPCOM_UNSUPPORTED_CORE_BLOCKS = [
	'core/file', // see D19851 for more details.
];

export const removeUnsupportedCoreBlocks = () => {
	WPCOM_UNSUPPORTED_CORE_BLOCKS.forEach( blockName => unregisterBlockType( blockName ) );
};
