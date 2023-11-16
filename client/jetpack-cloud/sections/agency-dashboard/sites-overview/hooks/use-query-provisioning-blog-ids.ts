import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { wpcomJetpackLicensing } from 'calypso/lib/wp';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';

type QueryProvisioningBlogIdsApiResponse = {
	provisioning_blog_ids: number[];
};

const useQueryProvisioningBlogIds = () => {
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	return useQuery< QueryProvisioningBlogIdsApiResponse, never, number[] >( {
		queryKey: [ 'jetpack-agency-dashboard-provisioning-sites' ],
		queryFn: () =>
			wpcomJetpackLicensing.req.get( {
				path: '/jetpack-agency/provisioning-sites',
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ) => data.provisioning_blog_ids,
		enabled: isPartnerOAuthTokenLoaded,
	} );
};

export default useQueryProvisioningBlogIds;
