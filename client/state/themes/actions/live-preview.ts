import { isJetpackSite } from 'calypso/state/sites/selectors';
import { LIVE_PREVIEW_START } from 'calypso/state/themes/action-types';
import { getTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { installAndLivePreview } from './install-and-live-preview';
import { redirectToLivePreview } from './redirect-to-live-preview';
import { suffixThemeIdForInstall } from './suffix-theme-id-for-install';

export function livePreview( themeId: string, siteId: number ) {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		dispatch( { type: LIVE_PREVIEW_START } );
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			return dispatch( installAndLivePreview( installId, siteId ) );
		}
		return dispatch( redirectToLivePreview( themeId, siteId ) );
	};
}
