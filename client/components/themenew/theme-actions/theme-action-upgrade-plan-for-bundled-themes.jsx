import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	doesThemeBundleSoftwareSet,
	isExternallyManagedTheme,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemePremium,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

// WPCOM-specific plan upgrade for premium themes with bundled software sets
export default function ThemeActionUpgradePlanForBundledThemes() {
	const { selectedStyleVariation, themeId } = useThemeContext();
	const { locale } = useThemeShowcaseContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const hasSoftwareSet = useSelector( ( state ) => doesThemeBundleSoftwareSet( state, themeId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const isAlreadyPurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	if (
		! siteId ||
		isJetpack ||
		isAtomic ||
		! isLoggedIn ||
		! isPremium ||
		! hasSoftwareSet ||
		isExternallyManaged ||
		isActive ||
		isAlreadyPurchased
	) {
		return null;
	}

	const { origin = 'https://wordpress.com' } = typeof window !== 'undefined' ? window.location : {};
	const redirectTo = encodeURIComponent(
		addQueryArgs( `${ origin }/setup/site-setup/designSetup`, {
			siteSlug,
			theme: themeId,
			style_variation: selectedStyleVariation?.slug,
		} )
	);

	const href = localizeThemesPath(
		`/checkout/${ siteSlug }/business?redirect_to=${ redirectTo }`,
		locale,
		! isLoggedIn
	);

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', {
			action: 'upgrade_plan_for_bundled_themes',
		} );
	};

	return (
		<PopoverMenuItem href={ href } onClick={ onClick }>
			{ translate( 'Upgrade to activate', {
				comment:
					'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
			} ) }
		</PopoverMenuItem>
	);
}
