import { isDefaultGlobalStylesVariationSlug, ThemeCard } from '@automattic/design-picker';
import ThemeTypeBadge from 'calypso/components/theme-type-badge';
import { decodeEntities } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getTheme, isInstallingTheme, isThemeActive } from 'calypso/state/themes/selectors';
import { setThemesBookmark } from 'calypso/state/themes/themes-ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useImageClick from './hooks/use-image-click';
import useSelectedStyleVariation from './hooks/use-selected-style-variation';
import ThemeActions from './theme-actions';
import { useThemeContext } from './theme-context';
import ThemePlaceholder from './theme-placeholder';
import ThemeThumbnail from './theme-thumbnail';
import ThemeUpdateAlert from './theme-update-alert';

export default function Theme( props ) {
	const { selectedStyleVariation, themeId } = useThemeContext();

	const { bookmarkRef, isPlaceholder } = props;

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isInstalling = useSelector( ( state ) => isInstallingTheme( state, themeId, siteId ) );

	const dispatch = useDispatch();

	const { onStyleVariationClick, onStyleVariationMoreClick } = useSelectedStyleVariation();
	const { imageClickUrl, imageLabel, onImageClick } = useImageClick( { selectedStyleVariation } );
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	if ( isPlaceholder || ! theme ) {
		return <ThemePlaceholder />;
	}

	const { name, description, soft_launched, style_variations = [] } = theme;

	const isLockedStyleVariation =
		shouldLimitGlobalStyles && ! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug );

	const setBookmark = () => dispatch( setThemesBookmark( themeId ) );

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
			imageActionLabel={ props?.imageActionLabel || imageLabel }
			imageClickUrl={ props?.imageClickUrl || imageClickUrl }
			isActive={ isActive }
			isInstalling={ isInstalling }
			isSoftLaunched={ soft_launched }
			isShowDescriptionOnImageHover
			name={ name }
			onClick={ setBookmark }
			onImageClick={ props?.onImageClick || onImageClick }
			onStyleVariationClick={ onStyleVariationClick }
			onStyleVariationMoreClick={ onStyleVariationMoreClick }
			optionsMenu={ <ThemeActions /> }
			ref={ bookmarkRef }
			selectedStyleVariation={ selectedStyleVariation }
			styleVariations={ style_variations }
		/>
	);
}
