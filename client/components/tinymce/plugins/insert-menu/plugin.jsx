import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce/tinymce';
import { renderToString } from 'react-dom/server';
import i18n from 'i18n-calypso';

import Gridicon from 'components/gridicon';
import config from 'config';

import menuItems from './menu-items';

const initialize = editor => {
	menuItems.forEach( item =>
		editor.addMenuItem( item.name, {
			classes: 'wpcom-insert-menu__menu-item',
			cmd: item.cmd,
			onPostRender() {
				this.innerHtml( renderToString( item.item ) );
			}
		} )
	);

	editor.addButton( 'wpcom_insert_menu', {
		type: 'splitbutton',
		title: i18n.translate( 'Insert content' ),
		classes: 'btn wpcom-insert-menu insert-menu',
		cmd: menuItems[0].cmd,
		menu: menuItems.map( ( { name } ) => editor.menuItems[ name ] ),
		onPostRender() {
			ReactDOM.render(
				<Gridicon icon="add-outline" />,
				this.$el[0].children[0]
			);
		}
	} );
};

export default () => {
	if ( ! config.isEnabled( 'post-editor/insert-menu' ) ) {
		return;
	}

	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
