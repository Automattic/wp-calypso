import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getThemeDetailsUrl } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function ThemeActionInfo() {
	const { selectedStyleVariation, themeId } = useThemeContext();
	const { locale, tabFilter } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const themeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	if ( isLoggedIn && siteId ) {
		return null;
	}

	const href = localizeThemesPath( themeDetailsUrl, locale, ! isLoggedIn );

	const onClick = () => recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'info' } );

	return (
		<PopoverMenuItem href={ href } onClick={ onClick }>
			{ translate( 'Info', {
				comment: 'label for displaying the theme info sheet',
			} ) }
		</PopoverMenuItem>
	);
}
