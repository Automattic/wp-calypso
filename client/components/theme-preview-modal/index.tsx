import { Button, Gridicon, RootChild } from '@automattic/components';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import PremiumBadge from 'calypso/components/premium-badge';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Theme } from 'calypso/types';

import './style.scss';

interface BackButtonProps {
	cssClass: string;
	onClick: () => void;
}

const BackButton: React.FC< BackButtonProps > = ( { cssClass, onClick } ) => {
	const translate = useTranslate();

	return (
		<Button className={ cssClass } borderless onClick={ onClick }>
			<Gridicon icon="chevron-left" size={ 18 } />
			{ translate( 'Back' ) }
		</Button>
	);
};

interface ThemePreviewModalProps {
	previewUrl: string;
	theme: Theme;
}

const ThemePreviewModal: React.FC< ThemePreviewModalProps > = ( { previewUrl, theme } ) => {
	const shortDescription = useMemo( () => {
		const idx = theme.description.indexOf( '. ' );
		return idx >= 0 ? theme.description.substring( 0, idx + 1 ) : theme.description;
	}, [ theme.description ] );

	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

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
				<div className="theme-preview-modal__navigation">
					<WordPressLogo size={ 24 } />
					<BackButton cssClass="theme-preview-modal__navigation-link" />
				</div>
				<div className="theme-preview-modal__content">
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						title={ theme.name }
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
