/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const blockType = 'a8c/tiled-gallery-v3';

const blockSettings = {
	title: __( 'Tiled Gallery v3' ),
	icon: 'format-gallery',
	category: 'jetpack',
	edit,
	save,
};

registerBlockType( blockType, blockSettings );
