import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

type Options = {
	enabled?: boolean;
};

const useColorPaletteVariations = (
	siteId: number | string,
	stylesheet: string,
	{ enabled = true }: Options = {}
) => {
	const searchParams = new URLSearchParams( window.location.search );
	const { data } = useQuery< any, unknown, GlobalStylesObject[] >( {
		queryKey: [ 'global-styles-color-palette', siteId, stylesheet ],
		queryFn: async () =>
			wpcomRequest< GlobalStylesObject[] >( {
				path: `/sites/${ encodeURIComponent( siteId ) }/global-styles-variation/color-palettes`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				query: new URLSearchParams( {
					stylesheet: searchParams.get( 'stylesheet' ) ?? stylesheet,
				} ).toString(),
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		enabled: !! siteId && !! stylesheet && enabled,
	} );

	return data;
};

export default useColorPaletteVariations;
