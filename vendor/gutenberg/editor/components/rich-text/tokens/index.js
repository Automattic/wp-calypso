/**
 * External dependencies
 */
import { has, isFunction } from 'lodash';

/**
 * WordPress dependencies
 */
import { isValidIcon, normalizeIconObject } from '@wordpress/blocks';
import { applyFilters } from '@wordpress/hooks';

/**
 * Browser dependencies
 */
const { error } = window.console;

/**
 * Validates the token settings object.
 *
 * @param {string} name     Token name.
 * @param {Object} settings Token settings.
 * @param {Object} state    core/editor state.
 *
 * @return {Object} Validated token settings.
 */
export function validateTokenSettings( name, settings, state ) {
	if ( typeof name !== 'string' ) {
		error(
			'Token names must be strings.'
		);
		return;
	}

	if ( ! /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( name ) ) {
		error(
			'Token names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-token'
		);
		return;
	}

	if ( has( state, [ name ] ) ) {
		error(
			'Token "' + name + '" is already registered.'
		);
		return;
	}

	settings = applyFilters( 'editor.registerToken', settings, name );

	if ( ! settings || ! isFunction( settings.save ) ) {
		error(
			'The "save" property must be specified and must be a valid function.'
		);
		return;
	}

	if ( has( settings, [ 'edit' ] ) && ! isFunction( settings.edit ) ) {
		error(
			'The "edit" property must be a valid function.'
		);
		return;
	}

	if ( has( settings, [ 'keywords' ] ) && settings.keywords.length > 3 ) {
		error(
			'The token "' + name + '" can have a maximum of 3 keywords.'
		);
		return;
	}

	if ( ! has( settings, [ 'title' ] ) || settings.title === '' ) {
		error(
			'The token "' + name + '" must have a title.'
		);
		return;
	}

	if ( typeof settings.title !== 'string' ) {
		error(
			'Token titles must be strings.'
		);
		return;
	}

	settings.icon = normalizeIconObject( settings.icon );

	if ( ! isValidIcon( settings.icon.src ) ) {
		error(
			'The icon passed is invalid. ' +
			'The icon should be a string, an element, a function, or an object following the specifications documented in https://wordpress.org/gutenberg/handbook/block-api/#icon-optional'
		);
		return;
	}

	return settings;
}
