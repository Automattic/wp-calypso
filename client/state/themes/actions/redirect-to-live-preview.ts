import { isJetpackSite } from 'calypso/state/sites/selectors';
import { LIVE_PREVIEW_END } from 'calypso/state/themes/action-types';
import { getLivePreviewUrl, getTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';

export function redirectToLivePreview( themeId: string, siteId: number ) {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		// Bail if the theme is not installed at this point, which means the installation failed.
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			return dispatch( { type: LIVE_PREVIEW_END } );
		}

		const url = getLivePreviewUrl( getState(), themeId, siteId );
		if ( url ) {
			window.location.href = url;
		}
	};
}
