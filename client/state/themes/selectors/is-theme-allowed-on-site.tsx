import config from '@automattic/calypso-config';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getThemeTierByTheme from 'calypso/state/themes/selectors/get-theme-tier-by-theme';
import { AppState } from 'calypso/types';

export default ( state: AppState, siteId: number, themeId: string ) => {
	const themeTier = getThemeTierByTheme( state, themeId );
	return config.isEnabled( 'themes/tiers' ) && themeTier?.feature
		? siteHasFeature( state, siteId, themeTier.feature )
		: true;
};
