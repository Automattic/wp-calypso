import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getThemeDetailsUrl, isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function useImageClick( { selectedStyleVariation, tabFilter, themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isActiveTheme = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const { data } = useActiveThemeQuery( siteId, isLoggedIn );
	const isFSEActive = data?.[ 0 ]?.is_block_theme ?? false;

	const customizeUrl = useSelector( ( state ) =>
		addQueryArgs( getCustomizeUrl( state, themeId, siteId, isFSEActive ), {
			from: 'theme-info',
			style_variation: selectedStyleVariation?.slug,
		} )
	);
	const themeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);

	const imageClickUrl = useMemo(
		() => ( isLoggedIn && isActiveTheme ? customizeUrl : themeDetailsUrl ),
		[ customizeUrl, isActiveTheme, isLoggedIn, themeDetailsUrl ]
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
		trackClick( 'theme', 'screenshot' );

		/**
		 * @todo Implement the Theme Showcase Event Recorder
		 * to avoid massive prop drilling or obscure functions passed around.
		 */
		// themeShowcaseEventRecorder.recordThemeClick( themeId, index, 'screenshot_info' );
	};

	return { imageClickUrl, imageLabel, onImageClick };
}
