import { getGlobalStylesId, updateGlobalStyles } from 'calypso/state/global-styles/actions';
import type { GlobalStyles } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';

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
	return async ( dispatch: CalypsoDispatch ) => {
		const globalStylesId = await dispatch( getGlobalStylesId( siteId, themeId ) );

		await dispatch( updateGlobalStyles( siteId, globalStylesId, globalStyles ) );
	};
}
