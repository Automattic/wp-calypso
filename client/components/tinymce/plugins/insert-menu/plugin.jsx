/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import i18n from 'i18n-calypso';
import React from 'react';
import { renderToString } from 'react-dom/server';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
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
			const [ insertContentElm, insertSpecialElm ] = this.$el[ 0 ].children;

			insertContentElm.innerHTML = renderToString( <Gridicon icon="add-outline" /> );

			const addTooltipListener = ( el, text ) => {
				el.addEventListener( 'mouseenter', () => {
					// We need to select the tooltip during the `mouseenter` event and not outside.
					// Otherwise, Tinymce renders an empty tooltip somewhere in the editor.
					// The following code is very inspired by the `mouseenter` handler in TinyMCE
					// (tinymce.core.ui.Widget.init)
					const btnTooltip = this.tooltip();

					btnTooltip.text( text );

					const rel = btnTooltip.testMoveRel( el, [ 'bc-tc', 'bc-tl', 'bc-tr' ] );

					btnTooltip.classes.toggle( 'tooltip-n', rel === 'bc-tc' );
					btnTooltip.classes.toggle( 'tooltip-nw', rel === 'bc-tl' );
					btnTooltip.classes.toggle( 'tooltip-ne', rel === 'bc-tr' );

					btnTooltip.moveRel( el, rel );
				} );
			};

			// Listen to `mouseenter` events on the (+) and (v) parts of the Inserter menu to show
			// the "Insert content" or "Insert special" tooltip.
			addTooltipListener( insertContentElm, i18n.translate( 'Insert content' ) );
			addTooltipListener( insertSpecialElm, i18n.translate( 'Insert special' ) );
		},
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
