import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	doesThemeBundleSoftwareSet,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemePremium,
	isExternallyManagedTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionPurchase() {
	const { selectedStyleVariation, themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const isAlreadyPurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);
	const hasSoftwareSet = useSelector( ( state ) => doesThemeBundleSoftwareSet( state, themeId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();

	if (
		! siteId ||
		( isJetpack && ! isAtomic ) ||
		! isLoggedIn ||
		! isPremium ||
		isAlreadyPurchased ||
		hasSoftwareSet ||
		isExternallyManaged ||
		isActive
	) {
		return null;
	}

	const redirectTo = encodeURIComponent(
		addQueryArgs( `/theme/${ themeId }/${ siteSlug }`, {
			style_variation: selectedStyleVariation?.slug,
		} )
	);

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'purchase' } );
	};

	return (
		<PopoverMenuItem
			href={ `/checkout/${ siteSlug }/value_bundle?redirect_to=${ redirectTo }` }
			onClick={ onClick }
		>
			{ translate( 'Purchase', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}
