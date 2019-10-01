/**
 * External dependencies
 */
import { keyBy, mapValues, get } from 'lodash';

/**
 * WordPress dependencies
 */
import { parse as parseBlocks } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import replacePlaceholders from "./replace-placeholders";

const { templates = [],  siteInformation = {} } = window.starterPageTemplatesConfig;

let allTemplatesBlockBySlug = mapValues( keyBy( templates, 'slug' ), ( { content, title } ) => ( {
	blocks: [],
	content,
	count: 0,
	isEmpty: ! content,
	isParsing: !! content,
	title,
} ) );

setTimeout( () => {
	allTemplatesBlockBySlug = mapValues( allTemplatesBlockBySlug, ( { content, title } ) => {
		const blocks = content ? parseBlocks( replacePlaceholders( content, siteInformation ) ) : [];

		return {
			blocks,
			count: blocks.length,
			isParsing: false,
			isEmpty: ! content,
			title,
		};
	} );

	// Clean up templates from window object.
}, 0 );

export const getAllTemplatesBlocks= () => allTemplatesBlockBySlug;

export const hasTemplates = () => !! templates.length;

export const getBlocksByTemplateSlug = slug => get( allTemplatesBlockBySlug, [ slug, 'blocks' ], [] );

export const getTitleByTemplateSlug = slug => get ( allTemplatesBlockBySlug, [ slug, 'title' ], [] );

export const getTemplateBySlug = slug => get( allTemplatesBlockBySlug, [ slug ], {} );

export const getFirstTemplateSlug = () => get( templates, [ 0, 'slug' ] );

export default allTemplatesBlockBySlug;
