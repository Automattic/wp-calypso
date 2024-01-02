import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import {
	upsertAndGetGlobalStylesId,
	updateGlobalStyles,
} from 'calypso/state/global-styles/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { LIVE_PREVIEW_START } from 'calypso/state/themes/action-types';
import {
	getActiveTheme,
	getCanonicalTheme,
	getTheme,
	getThemeType,
} from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { installTheme } from './install-theme';
import { redirectToLivePreview } from './redirect-to-live-preview';
import { suffixThemeIdForInstall } from './suffix-theme-id-for-install';
import type { GlobalStyles } from '@automattic/data-stores';

export function livePreview(
	siteId: number,
	themeId: string,
	styleVariation?: GlobalStyles,
	source?: 'list' | 'detail'
) {
	return async ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const analysis = recordTracksEvent( 'calypso_block_theme_live_preview_click', {
			active_theme: getActiveTheme( getState(), siteId ),
			site_id: siteId,
			source,
			theme_type: getThemeType( getState(), themeId ),
			theme: themeId,
		} );
		dispatch( withAnalytics( analysis, { type: LIVE_PREVIEW_START, themeId } ) );
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail, and we just switch to the Live Preview.
			// FIXME: Handle the case where the installation fails and the theme is not installed.
			await dispatch( installTheme( installId, siteId ) );
		}

		if ( styleVariation ) {
			const stylesheet = isJetpackSite( getState(), siteId )
				? themeId
				: getCanonicalTheme( getState(), siteId, themeId )?.stylesheet ?? '';

			const globalStylesId = await dispatch( upsertAndGetGlobalStylesId( siteId, stylesheet ) );
			dispatch( updateGlobalStyles( siteId, globalStylesId, styleVariation ) );
		}

		return dispatch( redirectToLivePreview( themeId, siteId ) );
	};
}
