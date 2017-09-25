/**
 * Internal dependencies
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
