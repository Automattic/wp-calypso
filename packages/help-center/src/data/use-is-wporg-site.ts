import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Analysis = {
	url: string;
	platform: string;
	meta: {
		title: string;
		favicon: string;
	};
	platform_data?: { is_wpcom: boolean };
};

export function useIsWpOrgSite( siteUrl: string | undefined, enabled = true ) {
	return useQuery( {
		queryKey: [ 'is-site-wporg-', siteUrl ],
		queryFn: async () => {
			const analysis = await wpcomRequest< Analysis >( {
				path: `/imports/analyze-url?site_url=${ encodeURIComponent( siteUrl as string ) }`,
				apiNamespace: 'wpcom/v2',
			} );
			if ( analysis.platform === 'wordpress' && ! analysis.platform_data?.is_wpcom ) {
				return true;
			}
			return false;
		},
		refetchOnWindowFocus: false,
		staleTime: Infinity,
		enabled: !! siteUrl && enabled,
	} );
}
