/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { get } from 'lodash';
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
const allTemplatesBlockBySlug = {};

for ( const k in templates ) {
	const template = templates[ k ];
	const { content, title, slug } = template;

	let parsedTemplate = {
		blocks: [],
		count: 0,
		isEmpty: ! content,
		isParsing: !! content,
		title,
		slug,
	};

	allTemplatesBlockBySlug[ slug ] = parsedTemplate;
	setTimeout( () => {
		if ( content ) {
			const blocks = parseBlocks( replacePlaceholders( content, siteInformation ) );
			parsedTemplate = { ...parsedTemplate, blocks, isParsing: false };
			allTemplatesBlockBySlug[ slug ] = parsedTemplate;
		}

		// Dispatch a global event to indicate a template has been parsed.
		window.dispatchEvent(
			new CustomEvent( 'onTemplateParse', {
				detail: { template: parsedTemplate },
			} )
		);
	}, 0 );
}

export const hasTemplates = () => !! templates.length;

export const getBlocksByTemplateSlug = slug =>
	get( allTemplatesBlockBySlug, [ slug, 'blocks' ], [] );

export const getTitleByTemplateSlug = slug => get( allTemplatesBlockBySlug, [ slug, 'title' ], [] );

export const getTemplateBySlug = slug => get( allTemplatesBlockBySlug, [ slug ], {} );

export const getFirstTemplateSlug = () => get( templates, [ 0, 'slug' ], null );

export const getTemplates = () => templates;

export default allTemplatesBlockBySlug;
