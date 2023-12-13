import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { getUnlock } from '../utils';

const SAVE_HUB_SAVE_BUTTON_SELECTOR = '.edit-site-save-hub__button';
const HEADER_SAVE_BUTTON_SELECTOR = '.edit-site-save-button__button';

const unlock = getUnlock();

/**
 * This overrides the `SaveButton` behavior by adding a listener and changing the copy.
 * Our objective is to open a custom modal ('ThemeUpgradeModal') instead of proceeding with the default behavior.
 * For more context, see the discussion on adding an official customization method: https://github.com/WordPress/gutenberg/pull/56807.
 */
export const useOverrideSaveButton = ( {
	setIsThemeUpgradeModalOpen,
}: {
	setIsThemeUpgradeModalOpen: any;
} ) => {
	const canvasMode = useSelect(
		( select ) =>
			unlock && select( 'core/edit-site' ) && unlock( select( 'core/edit-site' ) ).getCanvasMode(),
		[]
	);

	useEffect( () => {
		const saveButtonClickHandler: EventListener = ( e ) => {
			e.stopPropagation();
			setIsThemeUpgradeModalOpen( true );
		};
		const overrideSaveButtonClick = ( selector: string ) => {
			const button = document.querySelector( selector );
			if ( button ) {
				button.textContent = __( 'Upgrade now', 'wpcom-live-preview' );
				button.addEventListener( 'click', saveButtonClickHandler );
			}
		};

		/**
		 * This overrides the tooltip text for the save button.
		 *
		 * The tooltip is shown after a delay.
		 * So we observe the DOM changes to avoid being fragile to the delay.
		 * The observer is activated only when the user hovers over the button to optimize performance.
		 */
		const observer = new MutationObserver( ( mutations ) => {
			mutations.forEach( ( mutation ) => {
				mutation.addedNodes.forEach( ( node ) => {
					if ( node.nodeType === Node.ELEMENT_NODE ) {
						const tooltip = ( node as Element ).querySelector( '.components-tooltip' );
						if ( tooltip ) {
							tooltip.textContent = __( 'Upgrade now ⌘S', 'wpcom-live-preview' );
						}
					}
				} );
			} );
		} );
		const startObserver = () => {
			observer.observe( document.body, { childList: true } );
		};
		const stopObserver = () => {
			observer.disconnect();
		};
		const overrideSaveButtonHover = ( selector: string ) => {
			const button = document.querySelector( selector );
			if ( button ) {
				button.addEventListener( 'mouseover', startObserver );
				button.addEventListener( 'mouseout', stopObserver );
			}
		};

		if ( canvasMode === 'view' ) {
			overrideSaveButtonClick( SAVE_HUB_SAVE_BUTTON_SELECTOR );
			overrideSaveButtonHover( SAVE_HUB_SAVE_BUTTON_SELECTOR );
			return;
		}
		if ( canvasMode === 'edit' ) {
			overrideSaveButtonClick( HEADER_SAVE_BUTTON_SELECTOR );
			overrideSaveButtonHover( HEADER_SAVE_BUTTON_SELECTOR );
			return;
		}

		// This overrides the keyboard shortcut (⌘S) for saving.
		const overrideSaveButtonKeyboardShortcut = ( e: KeyboardEvent ) => {
			if ( e.key === 's' && ( e.metaKey || e.ctrlKey ) ) {
				e.preventDefault();
				e.stopPropagation();
				setIsThemeUpgradeModalOpen( true );
			}
		};
		document.addEventListener( 'keydown', overrideSaveButtonKeyboardShortcut );

		return () => {
			document
				.querySelector( SAVE_HUB_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'click', saveButtonClickHandler );
			document
				.querySelector( HEADER_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'click', saveButtonClickHandler );
			document
				.querySelector( SAVE_HUB_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'mouseover', startObserver );
			document
				.querySelector( HEADER_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'mouseover', startObserver );
			document
				.querySelector( SAVE_HUB_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'mouseout', stopObserver );
			document
				.querySelector( HEADER_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'mouseout', stopObserver );
			document.removeEventListener( 'keydown', overrideSaveButtonKeyboardShortcut );
		};
	}, [ canvasMode, setIsThemeUpgradeModalOpen ] );
};
