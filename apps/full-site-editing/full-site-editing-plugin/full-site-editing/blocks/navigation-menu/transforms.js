/**
 * External dependencies
 */

/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

const CORE_NAVIGATION_BLOCK_TYPE = 'core/navigation';

export const isValidCoreNavigationBlockType = type => CORE_NAVIGATION_BLOCK_TYPE === type;

export default {
	to: [
		{
			type: 'block',
			blocks: [ CORE_NAVIGATION_BLOCK_TYPE ],
			transform: () => {
				return createBlock( CORE_NAVIGATION_BLOCK_TYPE, {} );
			},
		},
	],
};
