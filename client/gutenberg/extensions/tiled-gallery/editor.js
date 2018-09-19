/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import './editor.scss';
import edit from './edit';
import save from './save';
import bridge from './bridge';
import controls from './controls';

export const blockType = 'a8c/tiled-gallery';

const blockSettings = {
	title: __( 'Tiled Gallery' ),
	icon: 'format-gallery',
	category: 'jetpack',
	edit,
	save,
};

registerBlockType( blockType, blockSettings );

addFilter( 'editor.BlockEdit', `${ blockType }/controls`, controls );
addFilter( 'editor.BlockListBlock', `${ blockType }/bridge`, bridge );
