/** @format */
/**
 * External dependencies
 */
import React from 'react';
import tinymce from 'tinymce/tinymce';
import { renderToString } from 'react-dom/server';
import i18n from 'i18n-calypso';
import GridiconAddOutline from 'gridicons/dist/add-outline';

/**
 * Internal dependencies
 */
import { menuItems, GridiconButton } from './menu-items';

function initialize( editor ) {
	menuItems.forEach( item =>
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
		menu: menuItems.map( ( { name } ) => editor.menuItems[ name ] ),
		onPostRender() {
			const [ insertContentElm ] = this.$el[ 0 ].children;

			insertContentElm.innerHTML = renderToString(
				<GridiconButton icon={ <GridiconAddOutline /> } label={ i18n.translate( 'Add' ) } />
			);
		},
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
