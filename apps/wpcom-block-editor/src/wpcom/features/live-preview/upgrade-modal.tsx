import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { ThemeUpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { useOverrideSaveButton } from './hooks/use-override-save-button';

import './upgrade-modal.scss';

export const LivePreviewUpgradeModal: FC< { themeId: string; upgradePlan: () => void } > = ( {
	themeId,
	upgradePlan,
} ) => {
	const [ isThemeUpgradeModalOpen, setIsThemeUpgradeModalOpen ] = useState( false );

	useOverrideSaveButton( { setIsThemeUpgradeModalOpen } );

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
