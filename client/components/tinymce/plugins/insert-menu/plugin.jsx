/** @format */
import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce/tinymce';
import { renderToString } from 'react-dom/server';
import i18n from 'i18n-calypso';

import Gridicon from 'gridicons';

import menuItems from './menu-items';

const initialize = editor => {
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
		type: 'splitbutton',
		title: i18n.translate( 'Insert content' ),
		classes: 'btn wpcom-insert-menu insert-menu',
		cmd: menuItems[ 0 ].cmd,
		menu: menuItems.map( ( { name } ) => editor.menuItems[ name ] ),
		onPostRender() {
			ReactDOM.render( <Gridicon icon="add-outline" />, this.$el[ 0 ].children[ 0 ] );

			// Listen to `mouseenter` events on the (+) part of the Inserter menu to show
			// the "Insert content" tooltip.
			const insertContentElm = this.$el[ 0 ].children[ 0 ];

			insertContentElm.addEventListener( 'mouseenter', () => {
				// We need to select the tooltip during the `mouseenter` event and not outside.
				// Otherwise, Tinymce renders an empty tooltip somewhere in the editor.
				const btnTooltip = this.tooltip();

				btnTooltip.text( i18n.translate( 'Insert content' ) );

				btnTooltip.moveBy( -10, 0 );
			} );

			insertContentElm.addEventListener( 'mouseleave', () => {
				const btnTooltip = this.tooltip();

				btnTooltip.moveBy( 10, 0 );
			} );

			// Listen to `mouseenter` events on the (v) part of the Inserter menu to show
			// the "Insert special" tooltip.
			const insertSpecialElm = this.$el[ 0 ].children[ 1 ];

			insertSpecialElm.addEventListener( 'mouseenter', () => {
				// We need to select the tooltip during the `mouseenter` event and not outside.
				// Otherwise, Tinymce renders an empty tooltip somewhere in the editor.
				const btnTooltip = this.tooltip();

				btnTooltip.text( i18n.translate( 'Insert special' ) );

				btnTooltip.moveBy( 24, 0 );
			} );

			insertSpecialElm.addEventListener( 'mouseleave', () => {
				const btnTooltip = this.tooltip();

				btnTooltip.moveBy( -24, 0 );
			} );
		},
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
