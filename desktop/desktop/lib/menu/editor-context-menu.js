
/**
 * Original library:
 * Author: Jeff Wear, Mixmax, Inc
 * License: MIT
 * From: https://github.com/mixmaxhq/electron-editor-context-menu
 */

var noop = function(){};
var cloneDeep = require('lodash/clonedeep');
var BrowserWindow = require('electron').BrowserWindow;
var Menu = require('electron').Menu;
var platform = require( '../platform' );

var DEFAULT_MAIN_MENU = [{
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
}];

var NO_SUGGESTIONS_ITEM = [{
	label: 'No suggestions',
	click: noop
}, { type: 'separator' } ];

var DEFINE_MENU_ITEM = [{
	label: 'Define',
	click: defineTerm,
	selectable: true,
	enabled: true
}, { type: 'separator' } ];

// define term is OSX only
function defineTerm() {
	var win = BrowserWindow.getFocusedWindow();
	win.showDefinitionForSelection();
}

/**
 * Builds a context menu suitable for showing in a text editor.
 * @return {Menu}
 */
var buildEditorContextMenu = function(selection) {

	if ( typeof selection === 'undefined' ) {
		selection = {
			isMisspelled: false,
			spellingSuggestions: []
		}
	}

	var contextMenu = cloneDeep(DEFAULT_MAIN_MENU);

	if (selection.isMisspelled) {
		var suggestions = selection.spellingSuggestions;
		if ( suggestions.length == 0 ) {
			contextMenu.unshift.apply(contextMenu, NO_SUGGESTIONS_ITEM);
		} else {
			contextMenu.unshift.apply(contextMenu, suggestions.map( function( suggestion ) {
				return {
					label: suggestion,
					click: function() {
						BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(suggestion);
					}
				};
			} ).concat( {
			  type: 'separator'
			} ) );
		}
	} else { // not misspelled, include define menu item
		if ( platform.isOSX() ) {
			contextMenu.unshift.apply(contextMenu, DEFINE_MENU_ITEM);
		}
	}

	return Menu.buildFromTemplate(contextMenu);
};

module.exports = buildEditorContextMenu;
