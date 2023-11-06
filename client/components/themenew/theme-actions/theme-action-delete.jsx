import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { confirmDelete } from 'calypso/state/themes/actions';
import { getTheme, isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function ThemeActionDelete() {
	const { themeId } = useThemeContext();
	const { origin } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const theme = useSelector( ( state ) => getTheme( state, siteId, themeId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if ( ! siteId || ! isJetpack || 'wpcom' === origin || ! theme || isActive ) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'delete_theme' } );
		dispatch( confirmDelete( themeId, siteId ) );
	};

	return <PopoverMenuItem onClick={ onClick }>{ translate( 'Delete' ) }</PopoverMenuItem>;
}
