import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useFetchDevLicense( blogId?: number ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-dev-license', agencyId, blogId ],
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/agency/license/dev-site',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
					...( blogId && { blog_id: blogId } ),
				}
			),
		select: ( data ) => ( {
			a4aSiteId: data?.a4a_site_id,
			licenseId: data?.license_id,
			productId: data?.product_id,
			siteUrl: data?.site_url,
		} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
