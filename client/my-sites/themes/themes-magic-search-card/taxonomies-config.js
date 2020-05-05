/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Taxonomies allowed in the search welcome suggestion card.
 */
export const taxonomiesWelcomeWhitelist = [ 'column', 'feature', 'layout', 'subject', 'style' ];

/**
 * Associates an icon to each taxonomy.
 */
const taxonomyToGridiconMap = {
	color: 'ink',
	column: 'align-justify',
	feature: 'customize',
	layout: 'layout',
	subject: 'info-outline',
	style: 'themes',
};

export function taxonomyToGridicon( taxonomy ) {
	return get( taxonomyToGridiconMap, taxonomy, 'tag' );
}
