import { isDefaultGlobalStylesVariationSlug, ThemeCard } from '@automattic/design-picker';
import ThemeTypeBadge from 'calypso/components/theme-type-badge';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { isInstallingTheme, isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useImageClick from './hooks/use-image-click';
import useSelectedStyleVariation from './hooks/use-selected-style-variation';
import useThemesBookmark from './hooks/use-themes-bookmark';
import ThemeActions from './theme-actions';
import { useThemeContext } from './theme-context';
import ThemePlaceholder from './theme-placeholder';
import ThemeThumbnail from './theme-thumbnail';
import ThemeUpdateAlert from './theme-update-alert';

export default function Theme( { isPlaceholder } ) {
	const { selectedStyleVariation, theme, themeId } = useThemeContext();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isInstalling = useSelector( ( state ) => isInstallingTheme( state, themeId, siteId ) );

	const { onStyleVariationClick, onStyleVariationMoreClick } = useSelectedStyleVariation();
	const { imageClickUrl, imageLabel, onImageClick } = useImageClick( { selectedStyleVariation } );
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	const { bookmarkRef, setThemesBookmark } = useThemesBookmark();

	if ( isPlaceholder || ! theme ) {
		return <ThemePlaceholder />;
	}

	const { name, description, soft_launched, style_variations = [] } = theme;

	const isLockedStyleVariation =
		shouldLimitGlobalStyles && ! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug );

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
