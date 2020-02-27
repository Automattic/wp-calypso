/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { get, map, keyBy } from 'lodash';
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

let templatesBySlug = {};

export const parseTemplates = () => {
	if ( Object.keys( templatesBySlug ).length ) {
		return templatesBySlug;
	}

	templatesBySlug = keyBy(
		map( templates, ( { content, slug, title } ) => ( {
			slug,
			title,
			blocks: content ? parseBlocks( replacePlaceholders( content, siteInformation ) ) : [],
			content,
		} ) ),
		'slug'
	);

	return templatesBySlug;
};

// Selectors.
export const getParsingBlocksByTemplateSlug = slug =>
	get( templatesBySlug, [ slug, 'blocks' ], [] );
export const getTitleByTemplateSlug = slug => get( templatesBySlug, [ slug, 'title' ], [] );
