import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

interface Theme {
	_links?: {
		'wp:user-global-styles'?: { href: string }[];
	};
}

const useGetGlobalStylesUserConfig = ( siteId: number | string, stylesheet: string ) => {
	return useQuery< GlobalStylesObject | null, unknown, unknown >(
		[ 'globalStylesUserConfig', siteId, stylesheet ],
		async () => {
			const theme = await wpcomRequest< Theme >( {
				path: `/sites/${ encodeURIComponent( siteId ) }/themes/${ stylesheet }`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} );

			const globalStylesURL = theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href;
			if ( ! globalStylesURL ) {
				return null;
			}

			const response = await window.fetch( globalStylesURL );
			const globalStylesObject: GlobalStylesObject = await response.json();

			return {
				id: globalStylesObject.id,
				settings: globalStylesObject.settings,
				styles: globalStylesObject.styles,
			};
		},
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
			enabled: !! ( siteId && stylesheet ),
		}
	);
};

export default useGetGlobalStylesUserConfig;
