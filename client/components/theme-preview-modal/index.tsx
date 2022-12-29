import { RootChild } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import PremiumBadge from 'calypso/components/premium-badge';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import type { Theme } from 'calypso/lib/types';

import './style.scss';

interface ThemePreviewModalProps {
	previewUrl: string;
	theme: Theme;
}

const ThemePreviewModal: ReactFC< ThemePreviewModalProps > = ( { previewUrl, theme } ) => {
	const translate = useTranslate();
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();

	function showGlobalStylesPremiumBadge() {
		if ( ! shouldLimitGlobalStyles ) {
			return null;
		}

		return (
			<PremiumBadge
				className="design-picker__premium-badge"
				labelText={ translate( 'Upgrade' ) }
				tooltipText={ translate(
					'Unlock this style, and tons of other features, by upgrading to a Premium plan.'
				) }
			/>
		);
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
						showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
					/>
				</div>
			</div>
		</RootChild>
	);
};

export default ThemePreviewModal;
