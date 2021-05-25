/**
 * External dependencies
 */
const { Menu, MenuItem } = require( 'electron' );

module.exports = function ( mainWindow ) {
	mainWindow.webContents.on( 'context-menu', ( event, params ) => {
		const menu = new Menu();

		const copy = new MenuItem( { label: 'Copy', role: 'copy' } );

		if ( ! params.isEditable ) {
			// If text is not editable, only permit the `Copy` action
			menu.append( copy );
		} else {
			// Add each spelling suggestion
			for ( const suggestion of params.dictionarySuggestions ) {
				menu.append(
					new MenuItem( {
						label: suggestion,
						click: () => mainWindow.webContents.replaceMisspelling( suggestion ),
					} )
				);
			}

			// Allow users to add the misspelled word to the dictionary
			if ( params.misspelledWord ) {
				menu.append( new MenuItem( { type: 'separator' } ) );
				menu.append(
					new MenuItem( {
						label: 'Add to Dictionary',
						click: () =>
							mainWindow.webContents.session.addWordToSpellCheckerDictionary(
								params.misspelledWord
							),
					} )
				);
			}

			// If text is editable, permit the Select All, Cut, Copy and Paste actions
			const cut = new MenuItem( { label: 'Cut', role: 'cut' } );
			const paste = new MenuItem( { label: 'Paste', role: 'paste' } );
			const selectAll = new MenuItem( { label: 'Select All', role: 'selectAll' } );

			const menuItems = [ selectAll, cut, copy, paste ];

			if ( params && params.dictionarySuggestions && params.dictionarySuggestions.length > 0 ) {
				menu.append( new MenuItem( { type: 'separator' } ) );
			}

			for ( const item of menuItems ) {
				menu.append( item );
			}
		}

		menu.popup();
	} );
};
