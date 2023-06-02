import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useSelector } from 'calypso/state';
import {
	isThemePremium,
	isPremiumThemeAvailable,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';

type Theme = {
	id: string;
	retired: boolean;
};

const useIsValidThankYouTheme = ( theme: Theme, siteId: number ): boolean => {
	const themeId = theme.id;
	const retired = theme.retired;

	useQuerySitePurchases( siteId );
	useQueryProductsList();

	const isExternallyManagedTheme = useSelector( ( state ) =>
		getIsExternallyManagedTheme( state, themeId )
	);

	const isMarketplaceThemeSubscribed = useSelector( ( state ) =>
		getIsMarketplaceThemeSubscribed( state, themeId, siteId )
	);

	const isPremium = useSelector( ( state ) => isThemePremium( state, themeId ) );
	const isThemePurchased = useSelector( ( state ) =>
		isPremiumThemeAvailable( state, themeId, siteId )
	);

	if ( isPremium && ! isThemePurchased && ! isExternallyManagedTheme ) {
		return false;
	}

	if ( isExternallyManagedTheme && ! isMarketplaceThemeSubscribed ) {
		return false;
	}

	if ( retired ) {
		return false;
	}

	return true;
};

export default useIsValidThankYouTheme;
