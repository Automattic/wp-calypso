/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * WordPress dependencies
 */
import { applyFilters, doAction } from '@wordpress/hooks';

/**
 * External dependencies
 */
import { isFunction } from 'lodash';

/**
 * Plugin definitions keyed by plugin name.
 *
 * @type {Object.<string,WPPlugin>}
 */
const plugins = {};

/**
 * Registers a plugin to the editor.
 *
 * @param {string}                    name            The name of the plugin.
 * @param {Object}                    settings        The settings for this plugin.
 * @param {Function}                  settings.render The function that renders the plugin.
 * @param {string|WPElement|Function} settings.icon   An icon to be shown in the UI.
 *
 * @return {Object} The final plugin settings object.
 */
export function registerPlugin( name, settings ) {
	if ( typeof settings !== 'object' ) {
		console.error(
			'No settings object provided!'
		);
		return null;
	}
	if ( typeof name !== 'string' ) {
		console.error(
			'Plugin names must be strings.'
		);
		return null;
	}
	if ( ! /^[a-z][a-z0-9-]*$/.test( name ) ) {
		console.error(
			'Plugin names must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: "my-plugin".'
		);
		return null;
	}
	if ( plugins[ name ] ) {
		console.error(
			`Plugin "${ name }" is already registered.`
		);
	}

	settings = applyFilters( 'plugins.registerPlugin', settings, name );

	if ( ! isFunction( settings.render ) ) {
		console.error(
			'The "render" property must be specified and must be a valid function.'
		);
		return null;
	}

	plugins[ name ] = {
		name,
		icon: 'admin-plugins',
		...settings,
	};

	doAction( 'plugins.pluginRegistered', settings, name );

	return settings;
}

/**
 * Unregisters a plugin by name.
 *
 * @param {string} name Plugin name.
 *
 * @return {?WPPlugin} The previous plugin settings object, if it has been
 *                     successfully unregistered; otherwise `undefined`.
 */
export function unregisterPlugin( name ) {
	if ( ! plugins[ name ] ) {
		console.error(
			'Plugin "' + name + '" is not registered.'
		);
		return;
	}
	const oldPlugin = plugins[ name ];
	delete plugins[ name ];

	doAction( 'plugins.pluginUnregistered', oldPlugin, name );

	return oldPlugin;
}

/**
 * Returns a registered plugin settings.
 *
 * @param {string} name Plugin name.
 *
 * @return {?Object} Plugin setting.
 */
export function getPlugin( name ) {
	return plugins[ name ];
}

/**
 * Returns all registered plugins.
 *
 * @return {Array} Plugin settings.
 */
export function getPlugins() {
	return Object.values( plugins );
}
