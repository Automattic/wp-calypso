import { RootChild } from '@automattic/components';
import { PremiumBadge, WooCommerceBundledBadge } from '@automattic/design-picker';
import { useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import {
	doesThemeBundleSoftwareSet as getDoesThemeBundleSoftwareSet,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isPremiumThemeAvailable as getIsPremiumThemeAvailable,
	isThemePremium as getIsThemePremium,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemePreviewModalNavigation from './navigation';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { Theme } from 'calypso/types';

import './style.scss';

interface ThemeWithStyleVariations extends Theme {
	style_variations?: StyleVariation[];
}

interface ThemePreviewModalProps {
	previewUrl: string;
	theme: ThemeWithStyleVariations;
	onClose: () => void;
}

const ThemePreviewModal: React.FC< ThemePreviewModalProps > = ( {
	previewUrl,
	theme,
	onClose,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const isThemePremium = useSelector( ( state ) => getIsThemePremium( state, theme.id ) );
	const isExternallyManagedTheme = useSelector( ( state ) =>
		getIsExternallyManagedTheme( state, theme.id )
	);
	const isPremiumThemeAvailable = useSelector( ( state ) =>
		getIsPremiumThemeAvailable( state, theme.id, siteId )
	);
	const doesThemeBundleSoftwareSet = useSelector( ( state ) =>
		getDoesThemeBundleSoftwareSet( state, theme.id )
	);
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	const shortDescription = useMemo( () => {
		const idx = theme.description.indexOf( '. ' );
		return idx >= 0 ? theme.description.substring( 0, idx + 1 ) : theme.description;
	}, [ theme.description ] );

	const badge = useMemo( () => {
		if ( ! isThemePremium ) {
			return null;
		}

		if ( ! doesThemeBundleSoftwareSet || isExternallyManagedTheme ) {
			return (
				<PremiumBadge
					tooltipClassName="theme-preview-tooltip"
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
				/>
			);
		}

		if ( doesThemeBundleSoftwareSet && ! isExternallyManagedTheme ) {
			return <WooCommerceBundledBadge tooltipClassName="theme-preview-tooltip" />;
		}

		return null;
	}, [
		isThemePremium,
		isExternallyManagedTheme,
		isPremiumThemeAvailable,
		doesThemeBundleSoftwareSet,
	] );

	useEffect( () => {
		document.documentElement.classList.add( 'no-scroll' );
		return () => {
			document.documentElement.classList.remove( 'no-scroll' );
		};
	}, [] );

	function showGlobalStylesPremiumBadge() {
		if ( ! shouldLimitGlobalStyles ) {
			return null;
		}

		return (
			<PremiumBadge
				className="design-picker__premium-badge"
				labelText={ translate( 'Upgrade' ) }
				tooltipClassName="theme-preview-tooltip"
				tooltipPosition="top"
				tooltipContent={ translate(
					'Unlock this style, and tons of other features, by upgrading to a Premium plan.'
				) }
				focusOnShow={ false }
			/>
		);
	}

	return (
		<RootChild>
			<div className="theme-preview-modal">
				<ThemePreviewModalNavigation title={ theme.name } onClose={ onClose } />
				<div className="theme-preview-modal__content">
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						title={
							<div className="theme-preview-modal__content-title design-picker-design-title__container">
								{ theme.name }
								{ badge }
							</div>
						}
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
