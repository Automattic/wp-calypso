import { isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { LIVE_PREVIEW_START } from 'calypso/state/themes/action-types';
import {
	getActiveTheme,
	getCanonicalTheme,
	getTheme,
	getThemeType,
	getThemePreviewThemeOptions,
	getThemeTierForTheme,
} from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { activateStyleVariation } from './activate-style-variation';
import { installTheme } from './install-theme';
import { redirectToLivePreview } from './redirect-to-live-preview';
import { suffixThemeIdForInstall } from './suffix-theme-id-for-install';

export function livePreview( siteId: number, themeId: string, source?: 'list' | 'detail' ) {
	return async ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const state = getState();
		const theme = getCanonicalTheme( state, siteId, themeId );
		const themeOptions = getThemePreviewThemeOptions( state );
		const hasStyleVariations = theme?.style_variations && theme?.style_variations.length > 0;
		const styleVariationSlug = themeOptions?.styleVariation?.slug;
		const analysis = recordTracksEvent( 'calypso_block_theme_live_preview_click', {
			active_theme: getActiveTheme( state, siteId ),
			site_id: siteId,
			source,
			theme_type: getThemeType( state, themeId ),
			theme_tier: getThemeTierForTheme( state, themeId )?.slug,
			theme: themeId,
			theme_style:
				themeId +
				( isDefaultGlobalStylesVariationSlug( styleVariationSlug )
					? ''
					: `-${ styleVariationSlug }` ),
		} );
		dispatch( withAnalytics( analysis, { type: LIVE_PREVIEW_START, themeId } ) );
		if ( isJetpackSite( state, siteId ) && ! getTheme( state, siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( state, siteId, themeId );
			// If theme is already installed, installation will silently fail, and we just switch to the Live Preview.
			// FIXME: Handle the case where the installation fails and the theme is not installed.
			await dispatch( installTheme( installId, siteId ) );
		}

		if ( hasStyleVariations ) {
			await dispatch(
				activateStyleVariation( themeId, siteId, themeOptions?.styleVariation ?? {} )
			);
		}

		return dispatch( redirectToLivePreview( themeId, siteId ) );
	};
}
