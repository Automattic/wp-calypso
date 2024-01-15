import { getGlobalStylesId, updateGlobalStyles } from 'calypso/state/global-styles/actions';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import type { GlobalStyles } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

/**
 * Triggers a network request to activate a specific style variation on a given site.
 * @param {string}  themeId      Theme ID
 * @param {number}  siteId       Site ID
 * @param {Object}  globalStyles The global styles to be activated
 * @returns {Function}           Action thunk
 */
export function activateStyleVariation(
	themeId: string,
	siteId: number,
	globalStyles: GlobalStyles
) {
	return async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		const state = getState();
		const theme = getCanonicalTheme( state, siteId, themeId );
		const themeStylesheet = theme?.stylesheet || themeId;
		const globalStylesId = await dispatch( getGlobalStylesId( siteId, themeStylesheet ) );

		await dispatch( updateGlobalStyles( siteId, globalStylesId, globalStyles ) );
	};
}
