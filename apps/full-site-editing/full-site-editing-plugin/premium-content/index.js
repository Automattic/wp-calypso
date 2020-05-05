/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

// Register Blocks
import * as container from './blocks/container';
import * as subscriberView from './blocks/subscriber-view';
import * as loggedOutView from './blocks/logged-out-view';

/**
 * Function to register an individual block.
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration} BlockConfiguration
 *
 * @typedef {Object} Block
 * @property {string} name
 * @property {string} category
 * @property {BlockConfiguration} settings
 *
 * @param {Block} block The block to be registered.
 */
const registerBlock = ( block ) => {
	if ( ! block ) {
		return;
	}

	const { name, category, settings } = block;

	registerBlockType( name, {
		category,
		...settings,
	} );
};

/**
 * Function to register blocks provided by CoBlocks.
 */
export const registerPremiumContentBlocks = () => {
	[ container, loggedOutView, subscriberView ].forEach( registerBlock );
};

registerPremiumContentBlocks();
