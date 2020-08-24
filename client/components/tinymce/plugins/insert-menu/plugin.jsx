/**
 * External dependencies
 */
import React from 'react';
import tinymce from 'tinymce/tinymce';
import { renderToString } from 'react-dom/server';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { menuItems, GridiconButton } from './menu-items';
import Gridicon from 'components/gridicon';

function initialize( editor ) {
	// Conditional menu item support:
	// Filters out menu item if has optional "condition" function field that returns false.
	const filteredMenuItems = menuItems.filter(
		( item ) => ! item.condition || item.condition( editor )
	);

	filteredMenuItems.forEach( ( item ) =>
		editor.addMenuItem( item.name, {
			classes: 'wpcom-insert-menu__menu-item',
			cmd: item.cmd,
			onPostRender() {
				this.innerHtml( renderToString( item.item ) );
			},
		} )
	);

	editor.addButton( 'wpcom_insert_menu', {
		type: 'menubutton',
		title: i18n.translate( 'Add content' ),
		classes: 'btn wpcom-insert-menu insert-menu',
		menu: filteredMenuItems.map( ( { name } ) => editor.menuItems[ name ] ),
		onPostRender() {
			const [ insertContentElm ] = this.$el[ 0 ].children;

			insertContentElm.innerHTML = renderToString(
				<GridiconButton
					icon={ <Gridicon icon="add-outline" /> }
					label={ i18n.translate( 'Add' ) }
				/>
			);
		},
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
