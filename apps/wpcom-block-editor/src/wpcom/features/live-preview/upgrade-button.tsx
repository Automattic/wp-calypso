import { __ } from '@wordpress/i18n';
import { FC, useEffect } from 'react';
import useCanvasMode from '../../hooks/use-canvas-mode';
import tracksRecordEvent from '../tracking/track-record-event';
import { usePreviewingTheme } from './hooks/use-previewing-theme';

import './upgrade-button.scss';

const SAVE_HUB_SAVE_BUTTON_SELECTOR = '.edit-site-save-hub__button';
const HEADER_SAVE_BUTTON_SELECTOR = '.edit-site-save-button__button';

export const LivePreviewUpgradeButton: FC< {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	upgradePlan: () => void;
} > = ( { previewingTheme, upgradePlan } ) => {
	const canvasMode = useCanvasMode();

	/**
	 * This overrides the `SaveButton` behavior by adding a listener and changing the copy.
	 * Our objective is to open the Plans page instead of proceeding with the default behavior.
	 * For more context, see the discussion on adding an official customization method: https://github.com/WordPress/gutenberg/pull/56807.
	 */
	useEffect( () => {
		const saveButtonClickHandler: EventListener = ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			tracksRecordEvent( 'calypso_block_theme_live_preview_upgrade_modal_open', {
				canvas_mode: canvasMode,
				opened_by: 'button_click',
				theme_type: previewingTheme.type,
				theme: previewingTheme.id,
			} );
			upgradePlan();
		};
		const saveButtonOriginalText: Record< string, string > = {};
		const overrideSaveButtonClick = ( selector: string ) => {
			const button = document.querySelector( selector );
			if ( button ) {
				saveButtonOriginalText[ selector ] = button.textContent || '';
				button.textContent = __( 'Upgrade now', 'wpcom-live-preview' );
				button.classList.add( 'wpcom-live-preview__upgrade-button' );
				button.addEventListener( 'click', saveButtonClickHandler );
			}
		};
		const resetSaveButton = () => {
			for ( const [ key, value ] of Object.entries( saveButtonOriginalText ) ) {
				const button = document.querySelector( key );
				if ( button && button.textContent !== '' ) {
					button.textContent = value;
					button.classList.remove( 'wpcom-live-preview__upgrade-button' );
					button.removeEventListener( 'click', saveButtonClickHandler );
				}
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
							tooltip.remove();
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
		const resetSaveButtonHover = () => {
			[ SAVE_HUB_SAVE_BUTTON_SELECTOR, HEADER_SAVE_BUTTON_SELECTOR ].forEach( ( selector ) => {
				const button = document.querySelector( selector );
				if ( button ) {
					button.removeEventListener( 'mouseover', startObserver );
					button.removeEventListener( 'mouseout', stopObserver );
				}
			} );
		};

		// Delay it to ensure the element is visible.
		const timeout = window.setTimeout( () => {
			if ( canvasMode === 'view' ) {
				overrideSaveButtonClick( SAVE_HUB_SAVE_BUTTON_SELECTOR );
				overrideSaveButtonHover( SAVE_HUB_SAVE_BUTTON_SELECTOR );
			} else if ( canvasMode === 'edit' ) {
				overrideSaveButtonClick( HEADER_SAVE_BUTTON_SELECTOR );
				overrideSaveButtonHover( HEADER_SAVE_BUTTON_SELECTOR );
			}
		}, 0 );

		return () => {
			resetSaveButton();
			resetSaveButtonHover();
			clearTimeout( timeout );
		};
	}, [ canvasMode, previewingTheme.id, previewingTheme.type, upgradePlan ] );

	useEffect( () => {
		// This overrides the keyboard shortcut (⌘S) for saving.
		const overrideSaveButtonKeyboardShortcut = ( e: KeyboardEvent ) => {
			if ( e.key === 's' && ( e.metaKey || e.ctrlKey ) ) {
				e.preventDefault();
				e.stopPropagation();
				tracksRecordEvent( 'calypso_block_theme_live_preview_upgrade_modal_open', {
					canvas_mode: canvasMode,
					opened_by: 'shortcut',
					theme_type: previewingTheme.type,
					theme: previewingTheme.id,
				} );
				upgradePlan();
			}
		};
		document.addEventListener( 'keydown', overrideSaveButtonKeyboardShortcut, { capture: true } );
		return () => {
			document.removeEventListener( 'keydown', overrideSaveButtonKeyboardShortcut, {
				capture: true,
			} );
		};
	}, [ canvasMode, previewingTheme.id, previewingTheme.type, upgradePlan ] );

	return null;
};
