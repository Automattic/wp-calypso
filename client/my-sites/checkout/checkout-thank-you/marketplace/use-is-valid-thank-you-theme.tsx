import { useSelector } from 'react-redux';
import {
	isThemePremium,
	isPremiumThemeAvailable,
	doesThemeBundleSoftwareSet,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';

type Theme = {
	id: string;
	retired: boolean;
};

const useIsValidThankYouTheme = ( theme: Theme, siteId: number ): boolean => {
	const themeId = theme.id;
	const retired = theme.retired;

	const isExternallyManagedTheme = useSelector( ( state ) =>
		getIsExternallyManagedTheme( state, themeId )
	);

	const isMarketplaceThemeSubscribed = useSelector( ( state ) =>
		getIsMarketplaceThemeSubscribed( state, themeId, siteId )
	);
	const isSiteEligibleForManagedExternalThemes = useSelector( ( state ) =>
		getIsSiteEligibleForManagedExternalThemes( state, siteId )
	);

	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const isThemePurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);

	const isBundledSoftwareSet = useSelector( ( state ) =>
		doesThemeBundleSoftwareSet( state, themeId )
	);

	if ( isPremium && ! isThemePurchased && ! isBundledSoftwareSet && ! isExternallyManagedTheme ) {
		return false;
	}

	if ( isPremium && ! isThemePurchased && isBundledSoftwareSet && ! isExternallyManagedTheme ) {
		return false;
	}

	if (
		isExternallyManagedTheme &&
		! isMarketplaceThemeSubscribed &&
		! isSiteEligibleForManagedExternalThemes
	) {
		return false;
	}

	if (
		isExternallyManagedTheme &&
		! isMarketplaceThemeSubscribed &&
		isSiteEligibleForManagedExternalThemes
	) {
		return false;
	}

	if ( retired ) {
		return false;
	}

	return true;
};

export default useIsValidThankYouTheme;
