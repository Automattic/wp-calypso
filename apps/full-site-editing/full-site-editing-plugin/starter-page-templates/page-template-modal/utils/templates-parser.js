/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { get, map } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { parse as parseBlocks } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import replacePlaceholders from './replace-placeholders';

const { templates = [], siteInformation = {} } = window.starterPageTemplatesConfig;
const allTemplatesBySlug = {};
const allTemplates = map( templates, ( { slug, title, preview, previewAlt } ) => ( {
	slug,
	title,
	preview,
	previewAlt,
} ) );

/**
 * Parse a template async.
 * Collect the parsed templates into the global allTemplatesBySlug.
 * Dispatch `onTemplateParse` global event.
 *
 * @param {string}	content	Template serialized content.
 * @param {string}	title	Template title.
 * @param {string}	slug	Template slug.
 * @return {number} Timeout identifier.
 */
const parseTemplate = ( { content, title, slug } ) => {
	return setTimeout( () => {
		const blocks = content ? parseBlocks( replacePlaceholders( content, siteInformation ) ) : [];

		const template = {
			blocks,
			count: blocks.length,
			isEmpty: ! content,
			title,
			slug,
		};

		// Populate global templates container.
		allTemplatesBySlug[ slug ] = template;

		// Dispatch a global event to indicate a template has been parsed.
		window.dispatchEvent( new CustomEvent( 'onTemplateParse', { detail: { template } } ) );
	}, 0 );
};

// Listen when a template is parsed, and start to parse another one if exists.
window.addEventListener( 'onTemplateParse', () => {
	const nextTemplate = templates.shift();
	if ( nextTemplate ) {
		parseTemplate( nextTemplate );
	}
} );

// Parse the first one template from the templates list.
const firstTemplate = templates.shift();
parseTemplate( firstTemplate );

// Selectors.
export const hasTemplates = () => !! templates.length;

export const getBlocksByTemplateSlug = slug => get( allTemplatesBySlug, [ slug, 'blocks' ], [] );

export const getTitleByTemplateSlug = slug => get( allTemplatesBySlug, [ slug, 'title' ], [] );

export const getTemplateBySlug = slug => get( allTemplatesBySlug, [ slug ], {} );

export const getFirstTemplateSlug = () => get( templates, [ 0, 'slug' ], null );

export const getAllTemplateSlugs = () => allTemplates;

export default allTemplatesBySlug;
