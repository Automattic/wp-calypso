import { isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { getGlobalStylesId, updateGlobalStyles } from 'calypso/state/global-styles/actions';
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
	hasStyleVariations: boolean,
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
			theme_style:
				themeId +
				( isDefaultGlobalStylesVariationSlug( styleVariation?.slug )
					? ''
					: `-${ styleVariation?.slug }` ),
		} );
		dispatch( withAnalytics( analysis, { type: LIVE_PREVIEW_START, themeId } ) );
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail, and we just switch to the Live Preview.
			// FIXME: Handle the case where the installation fails and the theme is not installed.
			await dispatch( installTheme( installId, siteId ) );
		}

		if ( hasStyleVariations ) {
			const theme = getCanonicalTheme( getState(), siteId, themeId );
			const stylesheet = theme?.stylesheet ?? themeId;

			const styleVariationToUpdate =
				styleVariation ??
				// Clear the global styles if the default style variation is selected.
				( {} as GlobalStyles );

			const globalStylesId = await dispatch( getGlobalStylesId( siteId, stylesheet ) );
			dispatch( updateGlobalStyles( siteId, globalStylesId, styleVariationToUpdate ) );
		}

		return dispatch( redirectToLivePreview( themeId, siteId ) );
	};
}
