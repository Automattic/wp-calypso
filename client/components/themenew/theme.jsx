import { isDefaultGlobalStylesVariationSlug, ThemeCard } from '@automattic/design-picker';
import page from 'page';
import ThemeTypeBadge from 'calypso/components/theme-type-badge';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getThemeDetailsUrl,
	isInstallingTheme,
	isThemeActive,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useImageClick from './hooks/use-image-click';
import useThemeShowcaseTracks from './hooks/use-theme-showcase-tracks';
import useThemesBookmark from './hooks/use-themes-bookmark';
import ThemeActions from './theme-actions';
import { useThemeContext } from './theme-context';
import ThemePlaceholder from './theme-placeholder';
import { useThemeShowcaseContext } from './theme-showcase-context';
import ThemeThumbnail from './theme-thumbnail';
import ThemeUpdateAlert from './theme-update-alert';

export default function Theme( { isPlaceholder } ) {
	const { selectedStyleVariation, setSelectedStyleVariation, theme, themeId } = useThemeContext();
	const { tabFilter } = useThemeShowcaseContext();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const themeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isInstalling = useSelector( ( state ) => isInstallingTheme( state, themeId, siteId ) );

	const { imageClickUrl, imageLabel, onImageClick } = useImageClick( { selectedStyleVariation } );
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	const { bookmarkRef, setThemesBookmark } = useThemesBookmark();
	const { recordThemeClick } = useThemeShowcaseTracks();

	if ( isPlaceholder || ! theme ) {
		return <ThemePlaceholder />;
	}

	const { name, description, soft_launched, style_variations = [] } = theme;

	const isLockedStyleVariation =
		shouldLimitGlobalStyles && ! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug );

	const onStyleVariationClick = ( styleVariation ) => {
		recordThemeClick( 'calypso_themeshowcase_theme_style_variation_click', {
			styleVariationSlug: styleVariation?.slug,
		} );
		setSelectedStyleVariation( styleVariation );
	};
	const onStyleVariationMoreClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_style_variation_more_click' );
		page( themeDetailsUrl );
	};

	return (
		<ThemeCard
			badge={
				<ThemeTypeBadge
					isLockedStyleVariation={ isLockedStyleVariation }
					siteId={ siteId }
					siteSlug={ siteSlug }
					themeId={ themeId }
				/>
			}
			banner={ <ThemeUpdateAlert /> }
			description={ decodeEntities( description ) }
			image={ <ThemeThumbnail /> }
			imageActionLabel={ imageLabel }
			imageClickUrl={ imageClickUrl }
			isActive={ isActive }
			isInstalling={ isInstalling }
			isSoftLaunched={ soft_launched }
			isShowDescriptionOnImageHover
			name={ name }
			onClick={ setThemesBookmark }
			onImageClick={ onImageClick }
			onStyleVariationClick={ onStyleVariationClick }
			onStyleVariationMoreClick={ onStyleVariationMoreClick }
			optionsMenu={ <ThemeActions /> }
			ref={ bookmarkRef }
			selectedStyleVariation={ selectedStyleVariation }
			styleVariations={ style_variations }
		/>
	);
}
