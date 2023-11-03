import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { addExternalManagedThemeToCart } from 'calypso/state/themes/actions';
import {
	isExternallyManagedTheme,
	isPremiumThemeAvailable,
	isSiteEligibleForManagedExternalThemes,
	isThemeActive,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionUpgradePlanForExternallyManagedThemes() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isSiteEligibleForExternallyManagedThemes = useSelector( ( state ) =>
		isSiteEligibleForManagedExternalThemes( state, siteId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isAlreadyPurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if (
		! siteId ||
		isJetpack ||
		isAtomic ||
		! isLoggedIn ||
		! isExternallyManaged ||
		( isExternallyManaged && isSiteEligibleForExternallyManagedThemes ) ||
		isActive ||
		isAlreadyPurchased
	) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', {
			action: 'upgrade_plan_for_bundled_themes',
		} );
		dispatch( addExternalManagedThemeToCart( themeId, siteId ) );
	};

	return (
		<PopoverMenuItem onClick={ onClick }>
			{ translate( 'Upgrade to subscribe', {
				comment:
					'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
			} ) }
		</PopoverMenuItem>
	);
}
