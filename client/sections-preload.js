/**
 * sections-preload
 *
 * This is a simple eventbus that sections.js listens to to know when to preload sections.
 * This exists because we needed a way to break the chunk dependency cycle. In days past,
 * the preloader was part of sections.js, and to preload a module, you would import sections
 * and call preload directly. Unfortunately, since all of the require.ensure calls live in sections,
 * that make webpack think that every chunk that included sections was dependant on every other chunk.
 * This ballooned compile times and made module analysis in chunks very difficult.
 *
 * To break the dependency cycle, we introduced sections-preload, which had no dependencies. Now modules
 * that want to preload a section can import sections-preload instead. sections also imports sections-preload
 * and listens on the exposed eventbus to know when to preload a section.
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
