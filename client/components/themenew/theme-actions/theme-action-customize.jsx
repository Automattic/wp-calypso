import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useIsFSEActive from '../hooks/use-is-fse-active';
import useThemeCustomizeUrl from '../hooks/use-theme-customize-url';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function ThemeActionCustomize() {
	const { themeId } = useThemeContext();
	const { locale } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const canEdit = useSelector( ( state ) => canCurrentUser( state, siteId, 'edit_theme_options' ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();
	const themeCustomizeUrl = useThemeCustomizeUrl();
	const isFSEActive = useIsFSEActive();

	if ( ! canEdit || ! isActive ) {
		return null;
	}

	const label = isFSEActive
		? translate( 'Edit', { comment: "label for button to edit a theme's design" } )
		: translate( 'Customize' );

	const href = localizeThemesPath( themeCustomizeUrl, locale, ! isLoggedIn );

	const onClick = () =>
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'customize' } );

	return (
		<PopoverMenuItem href={ href } onClick={ onClick }>
			{ label }
		</PopoverMenuItem>
	);
}
