/**
 * sections-info
 *
 * This is a simple eventbus that exposes section information without exposing the async loads for each section.
 *
 * In days past, the preloader was part of sections.js. To preload a module you would import sections
 * and call preload directly. However, all of the require.ensure calls live in sections.js. This makes
 * webpack think that imported sections was also dependant on every other chunk. The cyclic dependencies
 * ballooned compile times and made module analysis very difficult.
 *
 * To break the dependency cycle, we introduced the dependency-free `sections-info`.
 *
 * @format
 */

/**
 * External Dependencies
 */
import { createHooks } from '@wordpress/hooks';

/**
 * The event hub for the section preloader
 */
export const hooks = createHooks();

/**
 * Preload a section by name.
 *
 * @export
 * @param {String} sectionName The name of the section to load
 */
export function preload( sectionName ) {
	hooks.doAction( 'preload', sectionName );
}

export function getSection( sectionName ) {
	return hooks.applyFilters( 'get_section', undefined, sectionName );
}
