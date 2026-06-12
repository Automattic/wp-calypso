import { useSelector } from 'calypso/state';
import { isThemeAllowedOnSite } from 'calypso/state/themes/selectors/is-theme-allowed-on-site';

export function useIsThemeAllowedOnSite( siteId: number | null, themeId: string ) {
	return useSelector( ( state ) => isThemeAllowedOnSite( state, siteId, themeId ) );
}
