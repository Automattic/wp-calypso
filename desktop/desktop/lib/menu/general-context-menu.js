/**
 * External dependencies
 */
const electron = require( 'electron' );
const cloneDeep = require( 'lodash.clonedeep' );
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

/**
 * Internal dependencies
 */
const platform = require( '../platform' );

/**
 * General Context Menu
 * Showed when not in a textarea or editor
 */

// selectable attribute determines if menu item
// should only be enabled when text is selected
const DEFAULT_MAIN_TPL = [ {
	label: 'Copy',
	role: 'copy',
	selectable: true,
	enabled: true
}, {
	type: 'separator'
}, {
	label: 'Minimize',
	role: 'minimize'
} ];

// OS X Menu
// selectable attribute determines if menu item
// should only be enabled when text is selected
const DEFAULT_OSX_TPL = [ {
	label: 'Copy',
	role: 'copy',
	selectable: true,
	enabled: true
}, {
	label: 'Define',
	click: defineTerm,
	selectable: true,
	enabled: true
}, {
	type: 'separator'
}, {
	label: 'Minimize',
	role: 'minimize'
} ];

function defineTerm() {
	const focusedWindow = BrowserWindow.getFocusedWindow();
	focusedWindow.showDefinitionForSelection();
}

module.exports = function( selectedText ) {
	let template = {};

	if ( platform.isOSX() ) {
		template = cloneDeep( DEFAULT_OSX_TPL );
	} else {
		template = cloneDeep( DEFAULT_MAIN_TPL );
	}

	template.map( function( item ) {
		if ( ! selectedText ) {			// if no text is selected
			if ( item.selectable ) {	// and item is selectable
				item.enabled = false;	// disable menu item
			}
		}
	} );

	return Menu.buildFromTemplate( template );
};
