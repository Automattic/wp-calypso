/** @format */

/**
 * External dependencies
 */
import { getBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { replaceCoreVideoBlock } from './utils';

const name = 'videopress';

const coreVideoBlock = getBlockType( 'core/video' );

const settings = {
	...coreVideoBlock,
};

// Since we're building a block using the settings of a registered block, they
// already include a name which will override our custom name, so we need to
// delete it.
// See https://github.com/WordPress/gutenberg/blob/95edac1e42cb10ed7da9f406696cdc85d6e476d5/packages/blocks/src/api/registration.js#L67-L71
delete settings.name;

replaceCoreVideoBlock();

export { name, settings };
