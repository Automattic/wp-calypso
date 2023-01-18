import wpcom from 'calypso/lib/wp';
import type { ActiveTheme, GlobalStyles } from '@automattic/data-stores';

export function getGlobalStylesId( siteIdOrSlug: number | string, stylesheet: string ) {
	return async () => {
		const theme: ActiveTheme = await wpcom.req.get( {
			path: `/sites/${ encodeURIComponent( siteIdOrSlug ) }/themes/${ stylesheet }`,
			apiNamespace: 'wp/v2',
		} );

		const globalStylesUrl = theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href;
		if ( globalStylesUrl ) {
			// eslint-disable-next-line no-useless-escape
			const match = globalStylesUrl.match( /global-styles\/(?<id>[\/\w-]+)/ );
			if ( match && match.groups ) {
				return match.groups.id;
			}
		}

		return null;
	};
}

export function getGlobalStylesVariations( siteIdOrSlug: number | string, stylesheet: string ) {
	return async () => {
		const variations: GlobalStyles[] = await wpcom.req.get( {
			path: `/sites/${ encodeURIComponent(
				siteIdOrSlug
			) }/global-styles/themes/${ stylesheet }/variations`,
			apiNamespace: 'wp/v2',
		} );

		return variations;
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
