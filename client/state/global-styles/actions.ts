import wpcom from 'calypso/lib/wp';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import type { ActiveTheme, GlobalStyles } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

export function getGlobalStylesId( siteId: number, themeId: string ) {
	return async ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const state = getState();
		const theme = getCanonicalTheme( state, siteId, themeId );
		const stylesheet = theme?.stylesheet || themeId;
		const wpThemePreview = isJetpackSite( state, siteId ) ? themeId : stylesheet;
		const themes: ActiveTheme[] = await wpcom.req.get( {
			path: `/sites/${ encodeURIComponent( siteId ) }/themes?${ new URLSearchParams( {
				status: 'active',
				wp_theme_preview: wpThemePreview,
			} ).toString() }`,
			apiNamespace: 'wp/v2',
		} );

		const globalStylesUrl = themes[ 0 ]?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href;
		if ( globalStylesUrl ) {
			// eslint-disable-next-line no-useless-escape
			const match = globalStylesUrl.match( /global-styles\/(?<id>[\/\w-]+)/ );
			if ( match && match.groups ) {
				return +match.groups.id;
			}
		}
		return 0;
	};
}

export function updateGlobalStyles(
	siteIdOrSlug: number | string,
	globalStylesId: number,
	globalStyles: GlobalStyles
) {
	return async () => {
		const updatedGlobalStyles: GlobalStyles = await wpcom.req.post( {
			path: `/sites/${ encodeURIComponent( siteIdOrSlug ) }/global-styles/${ globalStylesId }`,
			apiNamespace: 'wp/v2',
			body: {
				id: globalStylesId,
				settings: globalStyles.settings ?? {},
				styles: globalStyles.styles ?? {},
			},
		} );

		return updatedGlobalStyles;
	};
}
