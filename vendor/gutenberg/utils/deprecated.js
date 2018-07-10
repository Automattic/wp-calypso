/**
 * WordPress dependencies
 */
import * as keycodesSource from '@wordpress/keycodes';
import deprecated from '@wordpress/deprecated';

// keycodes
const wrapKeycodeFunction = ( source, functionName ) => ( ...args ) => {
	deprecated( `wp.utils.keycodes.${ functionName }`, {
		version: '3.4',
		alternative: `wp.keycodes.${ functionName }`,
		plugin: 'Gutenberg',
	} );
	return source( ...args );
};

const keycodes = { ...keycodesSource, rawShortcut: {}, displayShortcut: {}, isKeyboardEvent: {} };
const modifiers = [ 'primary', 'primaryShift', 'secondary', 'access' ];
keycodes.isMacOS = wrapKeycodeFunction( keycodes.isMacOS, 'isMacOS' );
modifiers.forEach( ( modifier ) => {
	keycodes.rawShortcut[ modifier ] = wrapKeycodeFunction( keycodesSource.rawShortcut[ modifier ], 'rawShortcut.' + modifier );
	keycodes.displayShortcut[ modifier ] = wrapKeycodeFunction( keycodesSource.displayShortcut[ modifier ], 'displayShortcut.' + modifier );
	keycodes.isKeyboardEvent[ modifier ] = wrapKeycodeFunction( keycodesSource.isKeyboardEvent[ modifier ], 'isKeyboardEvent.' + modifier );
} );

export { keycodes };
