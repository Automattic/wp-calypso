import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import { AppState } from 'calypso/types';

export function canPublishThemeReview(
	state: AppState,
	themeId: string | undefined,
	siteId: number | undefined
) {
	const isLoggedIn = isUserLoggedIn( state );
	const isExternallyManagedTheme = themeId && getIsExternallyManagedTheme( state, themeId );
	const isMarketplaceThemeSubscribed =
		siteId && isExternallyManagedTheme && getIsMarketplaceThemeSubscribed( state, themeId, siteId );

	return isLoggedIn && ( ! isExternallyManagedTheme || isMarketplaceThemeSubscribed );
}
