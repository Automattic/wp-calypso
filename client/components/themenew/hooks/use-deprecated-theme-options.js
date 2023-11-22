import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeContext } from '../theme-context';

function useDeprecatedThemeOptions( __deprecatedThemeOptions ) {
	const { themeId } = useThemeContext();

	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );

	let __deprecatedDefaultOption = null;
	let __deprecatedSecondaryOption = null;

	if ( ! isLoggedIn || ! siteId ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.signup;
		__deprecatedSecondaryOption = null;
	} else if ( isActive ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.customize;
	} else if ( __deprecatedThemeOptions.upgradePlanForExternallyManagedThemes ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.upgradePlanForExternallyManagedThemes;
		__deprecatedSecondaryOption = null;
	} else if ( __deprecatedThemeOptions.upgradePlanForBundledThemes ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.upgradePlanForBundledThemes;
		__deprecatedSecondaryOption = null;
	} else if ( __deprecatedThemeOptions.purchase ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.purchase;
	} else if ( __deprecatedThemeOptions.upgradePlan ) {
		__deprecatedDefaultOption = __deprecatedThemeOptions.upgradePlan;
		__deprecatedSecondaryOption = null;
	} else {
		__deprecatedDefaultOption = __deprecatedThemeOptions.activate;
	}

	return { __deprecatedDefaultOption, __deprecatedSecondaryOption };
}

export default useDeprecatedThemeOptions;
