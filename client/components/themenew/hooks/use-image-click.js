import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getThemeDetailsUrl, isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeContext } from '../theme-context';
import useIsFSEActive from './use-is-fse-active';
import useThemeCustomizeUrl from './use-theme-customize-url';
import useThemeShowcaseTracks from './use-theme-showcase-tracks';

export default function useImageClick( { tabFilter } ) {
	const { selectedStyleVariation, themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isActiveTheme = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isFSEActive = useIsFSEActive();

	const themeCustomizeUrl = useThemeCustomizeUrl();

	const themeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const imageClickUrl = useMemo(
		() => ( isLoggedIn && isActiveTheme ? themeCustomizeUrl : themeDetailsUrl ),
		[ themeCustomizeUrl, isActiveTheme, isLoggedIn, themeDetailsUrl ]
	);

	const imageLabel = useMemo( () => {
		if ( ! isLoggedIn || ! isActiveTheme ) {
			return translate( 'Info', {
				comment: 'label for displaying the theme info sheet',
			} );
		}
		if ( isFSEActive ) {
			return translate( 'Edit', { comment: "label for button to edit a theme's design" } );
		}
		return translate( 'Customize' );
	}, [ isActiveTheme, isFSEActive, isLoggedIn, translate ] );

	const onImageClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'screenshot_info' } );
		trackClick( 'theme', 'screenshot' );
	};

	return { imageClickUrl, imageLabel, onImageClick };
}
