import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { LIVE_PREVIEW_START } from 'calypso/state/themes/action-types';
import { getActiveTheme, getTheme, getThemeType } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { installAndLivePreview } from './install-and-live-preview';
import { redirectToLivePreview } from './redirect-to-live-preview';
import { suffixThemeIdForInstall } from './suffix-theme-id-for-install';

export function livePreview( themeId: string, siteId: number, source?: 'list' | 'detail' ) {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const analysis = recordTracksEvent( 'calypso_block_theme_live_preview_click', {
			active_theme: getActiveTheme( getState(), siteId ),
			site_id: siteId,
			source,
			theme_type: getThemeType( getState(), themeId ),
			theme: themeId,
		} );
		dispatch( withAnalytics( analysis, { type: LIVE_PREVIEW_START } ) );
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail, and we just switch to the Live Preview.
			// FIXME: Handle the case where the installation fails and the theme is not installed.
			return dispatch( installAndLivePreview( installId, siteId ) );
		}
		return dispatch( redirectToLivePreview( themeId, siteId ) );
	};
}
