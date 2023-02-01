import { RootChild } from '@automattic/components';
import { PremiumBadge, WooCommerceBundledBadge } from '@automattic/design-picker';
import { useEffect, useMemo, useState } from '@wordpress/element';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import {
	doesThemeBundleSoftwareSet as getDoesThemeBundleSoftwareSet,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isPremiumThemeAvailable as getIsPremiumThemeAvailable,
	isThemePremium as getIsThemePremium,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemePreviewModalNavigation from './navigation';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import type { Theme } from 'calypso/types';

import './style.scss';

interface ThemeWithStyleVariations extends Theme {
	style_variations?: StyleVariation[];
}

interface ThemePreviewModalProps {
	theme: ThemeWithStyleVariations;
	previewUrl: string;
	actionButtons: React.ReactNode;
	shouldLimitGlobalStyles: boolean;
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
	onClickCategory: ( category: Category ) => void;
	onClose: () => void;
	recordDeviceClick: ( device: string ) => void;
}

const ThemePreviewModal: React.FC< ThemePreviewModalProps > = ( {
	theme,
	previewUrl,
	actionButtons,
	shouldLimitGlobalStyles,
	selectedVariation,
	onSelectVariation,
	onClickCategory,
	onClose,
	recordDeviceClick,
} ) => {
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
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState< StyleVariation | null >(
		selectedVariation || null
	);

	const shortDescription = useMemo( () => {
		const idx = theme.description.indexOf( '. ' );
		const hasStyleVariations = theme.style_variations && theme.style_variations.length > 0;
		return idx >= 0 && hasStyleVariations
			? theme.description.substring( 0, idx + 1 )
			: theme.description;
	}, [ theme.description, theme.style_variations ] );

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

	function previewDesignVariation( variation: StyleVariation ) {
		setSelectedStyleVariation( variation );
		onSelectVariation( variation );
	}

	return (
		<RootChild>
			<div
				className={ classnames( 'theme-preview-modal', {
					'theme-preview-modal--has-style-variations':
						theme.style_variations && theme.style_variations.length > 0,
				} ) }
			>
				<ThemePreviewModalNavigation
					title={ theme.name }
					titleBadge={ badge }
					actionButtons={ actionButtons }
					onClose={ onClose }
				/>
				<div className="theme-preview-modal__content">
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						title={
							<div className="theme-preview-modal__content-title design-picker-design-title__container">
								{ theme.name }
							</div>
						}
						author={ theme.author }
						categories={ theme.taxonomies?.theme_subject }
						description={ theme.description }
						shortDescription={ shortDescription }
						pricingBadge={ badge }
						variations={ theme.style_variations }
						selectedVariation={ selectedStyleVariation }
						onSelectVariation={ previewDesignVariation }
						onClickCategory={ onClickCategory }
						recordDeviceClick={ recordDeviceClick }
						actionButtons={ actionButtons }
						showGlobalStylesPremiumBadge={ shouldLimitGlobalStyles }
					/>
				</div>
			</div>
		</RootChild>
	);
};

export default ThemePreviewModal;
