import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getJetpackUpgradeUrlIfPremiumTheme,
	isExternallyManagedTheme,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemePremium,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

// Jetpack-specific plan upgrade
export default function ThemeActionUpgradePlan() {
	const { selectedStyleVariation, themeId } = useThemeContext();
	const { locale } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isAlreadyPurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);
	const jetpackUpgradeUrl = useSelector( ( state ) =>
		getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
		} )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	if (
		! siteId ||
		! isJetpack ||
		isAtomic ||
		! isLoggedIn ||
		! isPremium ||
		isExternallyManaged ||
		isActive ||
		isAlreadyPurchased
	) {
		return null;
	}

	const href = localizeThemesPath( jetpackUpgradeUrl, locale, ! isLoggedIn );

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'upgrade_plan' } );
	};

	return (
		<PopoverMenuItem href={ href } onClick={ onClick }>
			{ translate( 'Upgrade to activate', {
				comment: 'label prompting user to upgrade the Jetpack plan to activate a certain theme',
			} ) }
		</PopoverMenuItem>
	);
}
