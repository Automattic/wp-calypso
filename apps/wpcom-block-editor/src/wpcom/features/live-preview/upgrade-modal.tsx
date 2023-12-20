import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { ThemeUpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { useOverrideSaveButton } from './hooks/use-override-save-button';
import { usePreviewingTheme } from './hooks/use-previewing-theme';

import './upgrade-modal.scss';

export const LivePreviewUpgradeModal: FC< {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	upgradePlan: () => void;
} > = ( { previewingTheme, upgradePlan } ) => {
	const [ isThemeUpgradeModalOpen, setIsThemeUpgradeModalOpen ] = useState( false );

	useOverrideSaveButton( { setIsThemeUpgradeModalOpen, previewingTheme } );

	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={ queryClient }>
			<ThemeUpgradeModal
				additionalClassNames="wpcom-live-preview-upgrade-modal"
				additionalOverlayClassNames="wpcom-live-preview-upgrade-modal__overlay"
				// We can assume that the theme is present, as this component is rendered in that context.
				slug={ previewingTheme.id as string }
				isOpen={ isThemeUpgradeModalOpen }
				closeModal={ () => setIsThemeUpgradeModalOpen( false ) }
				checkout={ upgradePlan }
			/>
		</QueryClientProvider>
	);
};
