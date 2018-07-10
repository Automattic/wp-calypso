/**
 * Note: The order of the modifier keys in many of the [foo]Shortcut()
 * functions in this file are intentional and should not be changed. They're
 * designed to fit with the standard menu keyboard shortcuts shown in the
 * user's platform.
 *
 * For example, on MacOS menu shortcuts will place Shift before Command, but
 * on Windows Control will usually come first. So don't provide your own
 * shortcut combos directly to keyboardShortcut().
 */

/**
 * External dependencies
 */
import { get, mapValues, includes } from 'lodash';

export const BACKSPACE = 8;
export const TAB = 9;
export const ENTER = 13;
export const ESCAPE = 27;
export const SPACE = 32;
export const LEFT = 37;
export const UP = 38;
export const RIGHT = 39;
export const DOWN = 40;
export const DELETE = 46;

export const F10 = 121;

export const ALT = 'alt';
export const CTRL = 'ctrl';
// Understood in both Mousetrap and TinyMCE.
export const COMMAND = 'meta';
export const SHIFT = 'shift';

/**
 * Return true if platform is MacOS.
 *
 * @param {Object} _window   window object by default; used for DI testing.
 *
 * @return {boolean}         True if MacOS; false otherwise.
 */
export function isMacOS( _window = window ) {
	return _window.navigator.platform.indexOf( 'Mac' ) !== -1;
}

const modifiers = {
	primary: ( _isMac ) => _isMac() ? [ COMMAND ] : [ CTRL ],
	primaryShift: ( _isMac ) => _isMac() ? [ SHIFT, COMMAND ] : [ CTRL, SHIFT ],
	secondary: ( _isMac ) => _isMac() ? [ SHIFT, ALT, COMMAND ] : [ CTRL, SHIFT, ALT ],
	access: ( _isMac ) => _isMac() ? [ CTRL, ALT ] : [ SHIFT, ALT ],
};

/**
 * An object that contains functions to get raw shortcuts.
 * E.g. rawShortcut.primary( 'm' ) will return 'meta+m' on Mac.
 * These are intended for user with the KeyboardShortcuts component or TinyMCE.
 *
 * @type {Object} Keyed map of functions to raw shortcuts.
 */
export const rawShortcut = mapValues( modifiers, ( modifier ) => {
	return ( character, _isMac = isMacOS ) => {
		return [ ...modifier( _isMac ), character.toLowerCase() ].join( '+' );
	};
} );

/**
 * An object that contains functions to display shortcuts.
 * E.g. displayShortcut.primary( 'm' ) will return '⌘M' on Mac.
 *
 * @type {Object} Keyed map of functions to display shortcuts.
 */
export const displayShortcut = mapValues( modifiers, ( modifier ) => {
	return ( character, _isMac = isMacOS ) => {
		const isMac = _isMac();
		const replacementKeyMap = {
			[ ALT ]: isMac ? 'Option' : 'Alt',
			[ CTRL ]: 'Ctrl',
			[ COMMAND ]: '⌘',
			[ SHIFT ]: 'Shift',
		};
		const shortcut = [
			...modifier( _isMac ).map( ( key ) => get( replacementKeyMap, key, key ) ),
			character.toUpperCase(),
		].join( '+' );

		// Because we use just the clover symbol for MacOS's "command" key, remove
		// the key join character ("+") between it and the final character if that
		// final character is alphanumeric. ⌘S looks nicer than ⌘+S.
		return shortcut.replace( /⌘\+([A-Z0-9])$/g, '⌘$1' );
	};
} );

/**
 * An object that contains functions to check if a keyboard event matches a
 * predefined shortcut combination.
 * E.g. isKeyboardEvent.primary( event, 'm' ) will return true if the event
 * signals pressing ⌘M.
 *
 * @type {Object} Keyed map of functions to match events.
 */
export const isKeyboardEvent = mapValues( modifiers, ( getModifiers ) => {
	return ( event, character, _isMac = isMacOS ) => {
		const mods = getModifiers( _isMac );

		if ( ! mods.every( ( key ) => event[ `${ key }Key` ] ) ) {
			return false;
		}

		if ( ! character ) {
			return includes( mods, event.key.toLowerCase() );
		}

		return event.key === character;
	};
} );
