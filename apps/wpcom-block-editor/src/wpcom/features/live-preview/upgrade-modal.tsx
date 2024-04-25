import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { ThemeUpgradeModal, UpgradeModalClosedBy } from 'calypso/components/theme-upgrade-modal';
import tracksRecordEvent from '../tracking/track-record-event';
import { useOverrideSaveButton } from './hooks/use-override-save-button';
import { usePreviewingTheme } from './hooks/use-previewing-theme';

import './upgrade-modal.scss';

export const LivePreviewUpgradeModal: FC< {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	upgradePlan: () => void;
	requiredPlanSlug: string;
} > = ( { previewingTheme, upgradePlan, requiredPlanSlug } ) => {
	const [ isThemeUpgradeModalOpen, setIsThemeUpgradeModalOpen ] = useState( false );

	useOverrideSaveButton( { setIsThemeUpgradeModalOpen, previewingTheme } );

	const closeModal = useCallback(
		( closedBy?: UpgradeModalClosedBy ) => {
			tracksRecordEvent( 'calypso_block_theme_live_preview_upgrade_modal_close', {
				closed_by: closedBy,
				theme: previewingTheme.id,
				theme_type: previewingTheme.type,
			} );
			setIsThemeUpgradeModalOpen( false );
		},
		[ previewingTheme.id, previewingTheme.type ]
	);

	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={ queryClient }>
			<ThemeUpgradeModal
				additionalClassNames="wpcom-live-preview-upgrade-modal"
				additionalOverlayClassNames="wpcom-live-preview-upgrade-modal__overlay"
				// We can assume that the theme is present, as this component is rendered in that context.
				slug={ previewingTheme.id as string }
				isOpen={ isThemeUpgradeModalOpen }
				closeModal={ closeModal }
				checkout={ upgradePlan }
				requiredPlan={ requiredPlanSlug }
			/>
		</QueryClientProvider>
	);
};
