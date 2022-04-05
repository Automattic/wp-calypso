import { useQuery as useReactQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export function useSiteSettingsQuery( siteIdOrSlug: number | string | null ) {
	return useReactQuery(
		[ 'settings', siteIdOrSlug ],
		() => {
			return (
				siteIdOrSlug &&
				wpcom.req.get( `/sites/${ siteIdOrSlug }/settings?http_envelope=1`, {
					apiNamespace: 'rest/v1.2',
				} )
			);
		},
		{
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
		}
	);
}
