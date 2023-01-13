import wpcomRequest from 'wpcom-proxy-request';
import type { ActiveTheme, GlobalStyles } from '../site/types';

export const getGlobalStylesId = async ( siteSlug: string, stylesheet: string ) => {
	const theme: ActiveTheme = await wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteSlug ) }/themes/${ stylesheet }`,
		method: 'GET',
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

export const getGlobalStylesVariations = async ( siteSlug: string, stylesheet: string ) => {
	const variations: GlobalStyles[] = await wpcomRequest( {
		path: `/sites/${ encodeURIComponent(
			siteSlug
		) }/global-styles/themes/${ stylesheet }/variations`,
		method: 'GET',
		apiNamespace: 'wp/v2',
	} );

	return variations;
};

export const updateGlobalStyles = async (
	siteSlug: string,
	globalStyleId: number,
	globalStyles: GlobalStyles
) => {
	const updatedGlobalStyles: GlobalStyles = await wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteSlug ) }/global-styles/${ globalStyleId }`,
		apiNamespace: 'wp/v2',
		method: 'POST',
		body: {
			id: globalStyleId,
			settings: globalStyles.settings ?? {},
			styles: globalStyles.styles ?? {},
		},
	} );

	return updatedGlobalStyles;
};
