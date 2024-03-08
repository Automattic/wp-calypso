import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isMarketplaceThemeSubscribedByUser as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import { AppState } from 'calypso/types';

export function canPublishThemeReview( state: AppState, themeId: string | undefined ): boolean {
	const isLoggedIn = isUserLoggedIn( state );
	const isExternallyManagedTheme = !! ( themeId && getIsExternallyManagedTheme( state, themeId ) );
	const isMarketplaceThemeSubscribed =
		isExternallyManagedTheme && getIsMarketplaceThemeSubscribed( state, themeId );

	return isLoggedIn && ( ! isExternallyManagedTheme || isMarketplaceThemeSubscribed );
}
