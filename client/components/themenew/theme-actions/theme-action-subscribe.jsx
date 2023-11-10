import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { addExternalManagedThemeToCart } from 'calypso/state/themes/actions';
import {
	isThemeActive,
	doesThemeBundleSoftwareSet,
	isExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes,
} from 'calypso/state/themes/selectors';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors/is-marketplace-theme-subscribed';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionPurchase() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isStaging = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isSubscribed = useSelector( ( state ) =>
		isMarketplaceThemeSubscribed( state, themeId, siteId )
	);
	const hasSoftwareSet = useSelector( ( state ) => doesThemeBundleSoftwareSet( state, themeId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isSiteEligibleForExternallyManagedThemes = useSelector( ( state ) =>
		isSiteEligibleForManagedExternalThemes( state, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if (
		! siteId ||
		isStaging ||
		( isJetpack && ! isAtomic ) ||
		! isLoggedIn ||
		isSubscribed ||
		hasSoftwareSet ||
		! isExternallyManaged ||
		( isExternallyManaged && ! isSiteEligibleForExternallyManagedThemes ) ||
		isActive
	) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'subscribe' } );
		dispatch( addExternalManagedThemeToCart( themeId, siteId ) );
	};

	return (
		<PopoverMenuItem onClick={ onClick }>
			{ translate( 'Subscribe', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}
