/** @format */
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
		type: 'menubutton',
		title: i18n.translate( 'Add content' ),
		classes: 'btn wpcom-insert-menu insert-menu',
		menu: menuItems.map( ( { name } ) => editor.menuItems[ name ] ),
		onPostRender() {
			const [ insertContentElm ] = this.$el[ 0 ].children;

			insertContentElm.innerHTML = renderToString(
				<GridiconButton icon="add-outline" label={ i18n.translate( 'Add' ) } />
			);

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

			// Listen to `mouseenter` events on the (+)
			addTooltipListener( insertContentElm, i18n.translate( 'Add content' ) );
		},
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/insertmenu', initialize );
};
