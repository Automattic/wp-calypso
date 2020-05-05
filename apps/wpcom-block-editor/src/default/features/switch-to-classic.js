/* eslint-disable import/no-extraneous-dependencies */
/* global wpcomGutenberg */

/**
 * External dependencies
 */
import $ from 'jquery';

function addSwitchToClassicButton() {
	if ( ! wpcomGutenberg?.switchToClassic?.isVisible ) {
		return;
	}

	$( '#editor' ).on( 'click', '.edit-post-more-menu .components-button', () => {
		// We need to wait a few ms until the menu content is rendered
		setTimeout( () => {
			//role may be 'menu' or 'group', depending on the Gutenberg version
			$( '.edit-post-more-menu__content .components-menu-group:last-child > div[role]' ).append( `
					<a
						href="${ wpcomGutenberg.switchToClassic.url }" target="_top" role="menuitem"
						aria-label="${ wpcomGutenberg.switchToClassic.label }"
						class="components-button components-menu-item__button"
					>
						${ wpcomGutenberg.switchToClassic.label }
					</a>
				` );
		}, 0 );
	} );
}

$( () => {
	addSwitchToClassicButton();
} );
