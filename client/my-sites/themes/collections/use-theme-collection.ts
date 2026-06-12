import { useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import { useSelector, useStore } from 'calypso/state';
import {
	getActiveTheme,
	getIsLivePreviewStarted,
	getPremiumThemePrice,
	getThemeDetailsUrl as getThemeDetailsUrlSelector,
	getThemesForQueryIgnoringPage,
	getThemeType as getThemeTypeSelector,
	getThemeTierForTheme as getThemeTierForThemeSelector,
	isInstallingTheme,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export interface ThemesQuery {
	page: number;
	number: number;
	tier: string;
	filter: string;
	search: string;
	collection?: string;
	sort?: string;
}

export function useThemeCollection( query: ThemesQuery ) {
	const allThemes =
		useSelector( ( state ) => getThemesForQueryIgnoringPage( state, 'wpcom', query ) ) || [];
	const themes = query.number ? allThemes.slice( 0, query.number ) : allThemes;

	const siteId = useSelector( getSelectedSiteId );
	// getSelectedSiteId can return null/undefined (logged-out showcase). Normalize once so the
	// site-contexted theme selectors get a `number | undefined` rather than a `null` smuggled
	// through `as number`, which would key store lookups under `null`.
	const siteIdForThemeSelectors = siteId ?? undefined;

	// Per-theme state that changes on user actions (activate / install / live preview) is
	// selected reactively, so the cards re-render when it flips. These were previously
	// `useSelector( state => themeId => … )`, which returned a fresh function on every render —
	// react-redux flagged the unstable result and re-rendered every section on each dispatch.
	const activeThemeId = useSelector( ( state ) =>
		getActiveTheme( state, siteIdForThemeSelectors )
	);
	const isActive = useCallback(
		( themeId: string ) => themeId === activeThemeId,
		[ activeThemeId ]
	);

	// isInstallingTheme and getIsLivePreviewStarted are parameterized by themeId, so derive a
	// themeId→boolean map over the visible themes and compare it shallowly: stable reference,
	// and a re-render only when one of those states actually changes.
	const isInstallingMap = useSelector(
		( state ) =>
			siteIdForThemeSelectors === undefined
				? {}
				: Object.fromEntries(
						themes.map( ( theme ) => [
							theme.id,
							isInstallingTheme( state, theme.id, siteIdForThemeSelectors ),
						] )
				  ),
		shallowEqual
	);
	const isInstalling = useCallback(
		( themeId: string ) => isInstallingMap[ themeId ] ?? false,
		[ isInstallingMap ]
	);

	const isLivePreviewStartedMap = useSelector(
		( state ) =>
			Object.fromEntries(
				themes.map( ( theme ) => [ theme.id, getIsLivePreviewStarted( state, theme.id ) ] )
			),
		shallowEqual
	);
	const isLivePreviewStarted = useCallback(
		( themeId: string ) => isLivePreviewStartedMap[ themeId ] ?? false,
		[ isLivePreviewStartedMap ]
	);

	// These getters depend only on data that already triggers a render when it changes (the
	// themes list and siteId), so reading the latest store state at call time via useStore keeps
	// their references stable without losing reactivity.
	const store = useStore();

	const getPrice = useCallback(
		( themeId: string ) =>
			getPremiumThemePrice( store.getState(), themeId, siteIdForThemeSelectors ),
		[ store, siteIdForThemeSelectors ]
	);

	const getThemeType = useCallback(
		( themeId: string ) => getThemeTypeSelector( store.getState(), themeId ),
		[ store ]
	);

	const getThemeTierForTheme = useCallback(
		( themeId: string ) => getThemeTierForThemeSelector( store.getState(), themeId ),
		[ store ]
	);

	const getThemeDetailsUrl = useCallback(
		( themeId: string ) =>
			getThemeDetailsUrlSelector( store.getState(), themeId, siteIdForThemeSelectors ),
		[ store, siteIdForThemeSelectors ]
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
