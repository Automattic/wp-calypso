import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { FC, useEffect, useState } from 'react';
import { ThemeUpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { getUnlock } from './utils';
import './upgrade-modal.scss';

const SAVE_HUB_SAVE_BUTTON_SELECTOR = '.edit-site-save-hub__button';
const HEADER_SAVE_BUTTON_SELECTOR = '.edit-site-save-button__button';

const GRIDICONS_URL =
	'https://widgets.wp.com/wpcom-block-editor/images/gridicons-47c7fb356fcb2d963681.svg';
const GRIDICONS_ID = 'wpcom-live-preview-gridicons';

const unlock = getUnlock();

export const LivePreviewUpgradeModal: FC< { themeId: string; upgradePlan: () => void } > = ( {
	themeId,
	upgradePlan,
} ) => {
	const [ isThemeUpgradeModalOpen, setIsThemeUpgradeModalOpen ] = useState( false );
	const canvasMode = useSelect(
		( select ) =>
			unlock && select( 'core/edit-site' ) && unlock( select( 'core/edit-site' ) ).getCanvasMode(),
		[]
	);

	/**
	 * This overrides the `SaveButton` behavior by adding a listener and changing the copy.
	 * Our objective is to open a custom modal ('ThemeUpgradeModal') instead of proceeding with the default behavior.
	 * For more context, see the discussion on adding an official customization method: https://github.com/WordPress/gutenberg/pull/56807.
	 */
	useEffect( () => {
		const handler: EventListener = ( e ) => {
			e.stopPropagation();
			setIsThemeUpgradeModalOpen( true );
		};
		const overrideSaveButton = ( selector: string ) => {
			const button = document.querySelector( selector );
			if ( button ) {
				button.textContent = __( 'Upgrade now', 'wpcom-live-preview' );
				button.addEventListener( 'click', handler );
			}
		};
		if ( canvasMode === 'view' ) {
			overrideSaveButton( SAVE_HUB_SAVE_BUTTON_SELECTOR );
			return;
		}
		if ( canvasMode === 'edit' ) {
			overrideSaveButton( HEADER_SAVE_BUTTON_SELECTOR );
			return;
		}
		return () => {
			document
				.querySelector( SAVE_HUB_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'click', handler );
			document
				.querySelector( HEADER_SAVE_BUTTON_SELECTOR )
				?.removeEventListener( 'click', handler );
		};
	}, [ canvasMode ] );

	/**
	 * Load the SVG sprite for `Gridicon` in `@automattic/components`.
	 */
	useEffect( () => {
		fetch( GRIDICONS_URL )
			.then( ( response ) => response.text() )
			.then( ( svgData ) => {
				if ( document.getElementById( GRIDICONS_ID ) ) {
					return;
				}
				const div = document.createElement( 'div' );
				div.innerHTML = svgData;
				div.style.display = 'none';
				div.id = GRIDICONS_ID;
				document.body.insertBefore( div, document.body.childNodes[ 0 ] );
			} )
			.catch( () => {
				/** Do nothing */
			} );
	}, [] );

	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={ queryClient }>
			<ThemeUpgradeModal
				additionalClassNames="wpcom-live-preview-upgrade-modal"
				additionalOverlayClassNames="wpcom-live-preview-upgrade-modal__overlay"
				slug={ themeId }
				isOpen={ isThemeUpgradeModalOpen }
				closeModal={ () => setIsThemeUpgradeModalOpen( false ) }
				checkout={ upgradePlan }
			/>
		</QueryClientProvider>
	);
};
