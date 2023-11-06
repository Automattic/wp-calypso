import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { activate } from 'calypso/state/themes/actions';
import {
	isExternallyManagedTheme,
	isThemePremium,
	isPremiumThemeAvailable,
	isThemeActive,
	isWpcomTheme,
} from 'calypso/state/themes/selectors';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors/is-marketplace-theme-subscribed';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionActivate() {
	const { theme, themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isJetpackMultisite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isSubscribed = useSelector( ( state ) =>
		isMarketplaceThemeSubscribed( state, themeId, siteId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isWpcom = useSelector( ( state ) => isWpcomTheme( state, themeId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const isAlreadyPurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if (
		! siteId ||
		! isLoggedIn ||
		isJetpackMultisite ||
		( isExternallyManaged && ! theme && ! isSubscribed ) ||
		isActive ||
		( ! isWpcom && ! isAtomic ) ||
		( isPremium && ! isAlreadyPurchased )
	) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', {
			action: 'upgrade_plan_for_bundled_themes',
		} );
		dispatch( activate( themeId, siteId ) );
	};

	return <PopoverMenuItem onClick={ onClick }>{ translate( 'Activate' ) }</PopoverMenuItem>;
}
