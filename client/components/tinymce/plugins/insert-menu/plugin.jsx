import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce/tinymce';
import { renderToString } from 'react-dom/server';

import Gridicon from 'components/gridicon';
import i18n from 'lib/mixins/i18n';

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
			const parentNode = this.$el[0].children[0];
			const oldNode = parentNode.children[0];
			const newNode = document.createElement( 'span' );

			ReactDOM.render(
				<Gridicon icon={ menuItems[0].icon } />,
				newNode
			);

			parentNode.replaceChild( newNode, oldNode );
		}
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
