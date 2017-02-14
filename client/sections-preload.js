/**
 * sections-preload
 *
 * This is a simple eventbus that sections.js listens to to know when to preload sections.
 *
 * In days past, the preloader was part of sections.js. To preload a module you would import sections
 * and call preload directly. However, all of the require.ensure calls live in sections.js. This makes
 * webpack think that imported sections was also dependant on every other chunk. The cyclic dependencies
 * ballooned compile times and made module analysis very difficult.
 *
 * To break the dependency cycle, we introduced the dependency-free `sections-preload`.
 */

/**
 * External Dependencies
 */
import emitter from 'lib/mixins/emitter';

/**
 * The event hub for the section preloader
 */
export const hub = {};
emitter( hub );

/**
 * Preload a section by name
 *
 * @export
 * @param {String} section The named section to load
 */
export function preload( section ) {
	hub.emit( 'preload', section );
}
