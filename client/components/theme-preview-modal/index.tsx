import { RootChild } from '@automattic/components';
import AsyncLoad from 'calypso/components/async-load';
import type { Theme } from 'calypso/lib/types';

import './style.scss';

interface ThemePreviewModalProps {
	previewUrl: string;
	theme: Theme;
}

const ThemePreviewModal: React.FC< ThemePreviewModalProps > = ( { previewUrl, theme } ) => {
	if ( ! theme ) {
		return null;
	}

	return (
		<RootChild>
			<div className="theme-preview-modal">
				<div className="theme-preview-modal__content">
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						description={ theme.description }
						variations={ theme?.style_variations }
						// selectedVariation={ selectedStyleVariation }
						// onSelectVariation={ previewDesignVariation }
						// actionButtons={ actionButtons }
						// recordDeviceClick={ recordDeviceClick }
						// showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
					/>
				</div>
			</div>
		</RootChild>
	);
};

export default ThemePreviewModal;
