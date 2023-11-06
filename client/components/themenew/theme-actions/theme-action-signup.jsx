import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getThemeSignupUrl } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function ThemeActionSignup() {
	const { selectedStyleVariation, themeId } = useThemeContext();
	const { tabFilter } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const themeSignupUrl = useSelector( ( state ) =>
		getThemeSignupUrl( state, themeId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	if ( isLoggedIn && siteId ) {
		return null;
	}

	const onClick = () =>
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'signup' } );

	return (
		<PopoverMenuItem href={ themeSignupUrl } onClick={ onClick }>
			{ translate( 'Pick this design', {
				comment: 'when signing up for a WordPress.com account with a selected theme',
			} ) }
		</PopoverMenuItem>
	);
}
