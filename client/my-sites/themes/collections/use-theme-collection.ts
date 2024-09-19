import { useSelector } from 'calypso/state';
import {
	getIsLivePreviewStarted,
	getPremiumThemePrice,
	getThemeDetailsUrl as getThemeDetailsUrlSelector,
	getThemesForQueryIgnoringPage,
	getThemeType as getThemeTypeSelector,
	getThemeTierForTheme as getThemeTierForThemeSelector,
	isInstallingTheme,
	isThemeActive,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export interface ThemesQuery {
	page: number;
	number: number;
	tier: string;
	filter: string;
	search: string;
	collection: string;
}

export function useThemeCollection( query: ThemesQuery ) {
	const themes =
		useSelector( ( state ) => getThemesForQueryIgnoringPage( state, 'wpcom', query ) ) || [];

	const siteId = useSelector( getSelectedSiteId );

	const isInstalling = useSelector(
		( state ) => ( themeId: string ) => isInstallingTheme( state, themeId, siteId as number )
	);

	const isLivePreviewStarted = useSelector(
		( state ) => ( themeId: string ) => getIsLivePreviewStarted( state, themeId )
	);

	const getPrice = useSelector(
		( state ) => ( themeId: string ) => getPremiumThemePrice( state, themeId, siteId as number )
	);

	const isActive = useSelector(
		( state ) => ( themeId: string ) => isThemeActive( state, themeId, siteId as number )
	);

	const getThemeType = useSelector(
		( state ) => ( themeId: string ) => getThemeTypeSelector( state, themeId )
	);

	const getThemeTierForTheme = useSelector(
		( state ) => ( themeId: string ) => getThemeTierForThemeSelector( state, themeId )
	);

	const getThemeDetailsUrl = useSelector(
		( state ) => ( themeId: string ) =>
			getThemeDetailsUrlSelector( state, themeId, siteId as number )
	);

	const filterString = useSelector( ( state ) => prependThemeFilterKeys( state, query.filter ) );

	return {
		getPrice,
		themes,
		isActive,
		isInstalling,
		isLivePreviewStarted,
		siteId,
		getThemeType,
		getThemeTierForTheme,
		filterString,
		getThemeDetailsUrl,
	};
}
