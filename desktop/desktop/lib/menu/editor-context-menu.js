/**
 * Original library:
 * Author: Jeff Wear, Mixmax, Inc
 * License: MIT
 * From: https://github.com/mixmaxhq/electron-editor-context-menu
 */

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

const noop = function() {};

const DEFAULT_MAIN_MENU = [ {
	label: 'Cut',
	role: 'cut'
}, {
	label: 'Copy',
	role: 'copy'
}, {
	label: 'Paste',
	role: 'paste'
}, {
	label: 'Select All',
	role: 'selectall'
} ];

const NO_SUGGESTIONS_ITEM = [ {
	label: 'No suggestions',
	click: noop
}, {
	type: 'separator'
} ];

const DEFINE_MENU_ITEM = [ {
	label: 'Define',
	click: defineTerm,
	selectable: true,
	enabled: true
}, {
	type: 'separator'
} ];

// define term is OSX only
function defineTerm() {
	const focusedWindow = BrowserWindow.getFocusedWindow();
	focusedWindow.showDefinitionForSelection();
}

/**
 * Builds a context menu suitable for showing in a text editor.
 * @param {{}} selection Holds data relating to a selected word or phrase
 * @return {Menu} Electron.Menu instance
 */
const buildEditorContextMenu = function( selection ) {
	if ( typeof selection === 'undefined' ) {
		selection = {
			isMisspelled: false,
			spellingSuggestions: []
		};
	}

	const contextMenu = cloneDeep( DEFAULT_MAIN_MENU );

	if ( selection.isMisspelled ) {
		const suggestions = selection.spellingSuggestions;

		if ( suggestions.length === 0 ) {
			contextMenu.unshift.apply( contextMenu, NO_SUGGESTIONS_ITEM );
		} else {
			contextMenu.unshift.apply( contextMenu, suggestions.map( function( suggestion ) {
				return {
					label: suggestion,
					click: function() {
						BrowserWindow.getFocusedWindow().webContents.replaceMisspelling( suggestion );
					}
				};
			} ).concat( {
				type: 'separator'
			} ) );
		}
	} else if ( platform.isOSX() ) {
		// not misspelled, include define menu item
		contextMenu.unshift.apply( contextMenu, DEFINE_MENU_ITEM );
	}

	return Menu.buildFromTemplate( contextMenu );
};

module.exports = buildEditorContextMenu;
