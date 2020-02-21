/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { get, map } from 'lodash';
import debugFactory from 'debug';
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

// Debugger.
const debug = debugFactory( 'spt:parsing' );

// Parsing template index.
let parsingTemplateIndex = 0;

const { templates = [], siteInformation = {} } = window.starterPageTemplatesConfig;
const templatesBySlug = {};
const allTemplates = map( templates, ( { slug, title, preview, previewAlt } ) => ( {
	slug,
	title,
	preview,
	previewAlt,
} ) );

/**
 * Parse a template async.
 * Collect the parsed templates into the global templatesBySlug.
 * Dispatch `onTemplateParse` global event.
 *
 * @param   {object} template         Page Template.
 * @param   {string} template.content Template serialized content.
 * @param   {string} template.title	  Template title.
 * @param   {string} template.slug	  Template slug.
 * @returns {number} Timeout identifier.
 */
const parseTemplate = ( { content, title, slug } ) => {
	return setTimeout( () => {
		if ( templatesBySlug[ slug ] ) {
			return debug( "'%s' template is already parsed", slug );
		}

		const blocks = content ? parseBlocks( replacePlaceholders( content, siteInformation ) ) : [];

		const template = {
			blocks,
			count: blocks.length,
			isEmpty: ! content,
			title,
			slug,
		};

		debug( '%o template parsed', slug );

		// Populate global templates container.
		templatesBySlug[ slug ] = template;

		// Dispatch a global event to indicate a template has been parsed.
		/* eslint-disable no-undef */
		window.dispatchEvent( new CustomEvent( 'onTemplateParse', { detail: { ...template } } ) );
		/* eslint-enable no-undef */
	}, 0 );
};

/*
 * Listen when a template is parsed through of the `onTemplateParse` window event,
 * and immediately after, start to parse the following one and so on
 * until the last template.
 */
window.addEventListener( 'onTemplateParse', () => {
	parsingTemplateIndex++;
	if ( parsingTemplateIndex < templates.length ) {
		parseTemplate( templates[ parsingTemplateIndex ] );
	} else {
		debug(
			'All (%o) templates have been parsed: %o',
			Object.keys( templatesBySlug ).length,
			templatesBySlug
		);
	}
} );

/*
 * Start to parse the first one template from the templates list.
 * It triggers the process, parsing all templates, one by one.
 */
parseTemplate( templates[ parsingTemplateIndex ] );

// Selectors.
export const hasTemplates = () => !! templates.length;

export const getParsingBlocksByTemplateSlug = slug =>
	get( templatesBySlug, [ slug, 'blocks' ], [] );

export const getTitleByTemplateSlug = slug => get( templatesBySlug, [ slug, 'title' ], [] );

export const getAllParsingTemplates = () => allTemplates;

export default templatesBySlug;
