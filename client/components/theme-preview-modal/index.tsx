import { RootChild } from '@automattic/components';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import PremiumBadge from 'calypso/components/premium-badge';
import { usePremiumGlobalStylesSelectedSite } from 'calypso/state/sites/hooks/use-premium-global-styles';
import type { Theme } from 'calypso/lib/types';

import './style.scss';

interface ThemePreviewModalProps {
	previewUrl: string;
	theme: Theme;
}

const ThemePreviewModal: React.FC< ThemePreviewModalProps > = ( { previewUrl, theme } ) => {
	const shortDescription = useMemo( () => {
		const idx = theme.description.indexOf( '. ' );
		return idx >= 0 ? theme.description.substring( 0, idx + 1 ) : theme.description;
	}, [ theme.description ] );

	const { shouldLimitGlobalStyles } = usePremiumGlobalStylesSelectedSite();
	const translate = useTranslate();

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
						description={ shortDescription }
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
