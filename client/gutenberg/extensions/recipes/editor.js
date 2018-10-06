/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import RecipeEdit from './edit.jsx';
import RecipeSave from './save.jsx';

const blockType = 'a8c/recipes';
const blockSettings = {
	title: __( 'Recipe' ),
	description: __(
		'Embed a recipe with consistent formatting, basic metadata, and an option to print.'
	),
	icon: 'carrot',
	category: 'common',
	keywords: [ __( 'recipes' ), __( 'food' ) ],
	attributes: {
		title: {
			type: 'string',
		},
		servings: {
			type: 'string',
		},
		time: {
			type: 'string',
		},
		difficulty: {
			type: 'string',
		},
		print: {
			type: 'boolean',
		},
		source: {
			type: 'string',
			default: __( 'Source' ),
		},
		sourceurl: {
			type: 'string',
		},
		image: {
			type: 'string',
		},
		description: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		notes: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		ingredients: {
			type: 'array',
			source: 'children',
			selector: 'li',
		},
		directions: {
			type: 'array',
			source: 'children',
			selector: 'li',
		},
	},
	edit: RecipeEdit,
	save: RecipeSave,
};

registerBlockType( blockType, blockSettings );
