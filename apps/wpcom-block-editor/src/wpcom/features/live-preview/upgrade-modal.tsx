import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { ThemeUpgradeModal } from 'calypso/components/theme-upgrade-modal';
import './upgrade-modal.scss';

const GRIDICONS_URL =
	'https://widgets.wp.com/wpcom-block-editor/images/gridicons-47c7fb356fcb2d963681.svg';
const GRIDICONS_ID = 'wpcom-live-preview-gridicons';


export const LivePreviewUpgradeModal: FC< { themeId: string; upgradePlan: () => void } > = ( {
	themeId,
	upgradePlan,
} ) => {
	const [ isThemeUpgradeModalOpen, setIsThemeUpgradeModalOpen ] = useState( false );

	/**
	 * FIXME: This is only testing purpose to show the modal.
	 * SaveButton customization should be changed to use https://github.com/WordPress/gutenberg/pull/56807.
	 */
	useEffect( () => {
		const button = document.querySelector( '.edit-site-save-hub__button' );
		button?.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			setIsThemeUpgradeModalOpen( true );
		} );
	}, [] );

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
