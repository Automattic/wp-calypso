/* global _currentSiteId, wpcomGutenberg */

/**
 * External dependencies
 */
import $ from 'jquery';

function addSwitchToClassicButton() {
	if ( ! wpcomGutenberg.switchToClassic.isVisible ) {
		return;
	}

	$( '#editor' ).on( 'click', '.edit-post-more-menu .components-button', () => {
		// We need to wait a few ms until the menu content is rendered
		setTimeout( () => {
			$( '.edit-post-more-menu__content .components-menu-group:last-child > div[role=menu]' )
				.append( `
				<button type="button" aria-label="${ wpcomGutenberg.switchToClassic.label }" role="menuitem"
					class="components-button components-menu-item__button components-menu-item__button-switch">
					${ wpcomGutenberg.switchToClassic.label }
				</button>;
			` );
			$( '.components-menu-item__button-switch' ).on( 'click', () => {
				$.wpcom_proxy_request( {
					method: 'POST',
					path: `/sites/${ _currentSiteId }/gutenberg`,
					apiNamespace: 'wpcom/v2',
					query: {
						platform: 'web',
						editor: 'classic',
					},
				} ).done( () => {
					if ( wpcomGutenberg.isCalypsoify ) {
						top.window.location.replace( wpcomGutenberg.switchToClassic.url );
					} else {
						top.window.location.reload();
					}
				} );
			} );
		}, 0 );
	} );
}

$( () => {
	addSwitchToClassicButton();
} );
