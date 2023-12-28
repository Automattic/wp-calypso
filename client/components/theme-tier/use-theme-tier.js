import { createSelector } from '@automattic/state-utils';
import getThemeTier from 'calypso/components/theme-tier/get-theme-tier';
import { useSelector } from 'calypso/state';

export default ( siteId, themeId ) =>
	useSelector(
		createSelector(
			( state ) => getThemeTier( state, siteId, themeId ),
			( state ) => state.themes.queries[ siteId ]
		)
	);
