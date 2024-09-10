import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { isClientView } from '../../purchases/payment-methods/lib/is-client-view';

export default function useFetchClientReferral( {
	agencyId,
	referralId,
	secret,
}: {
	agencyId?: number;
	referralId?: number;
	secret?: string;
} ) {
	const isClient = isClientView();
	const data = useQuery( {
		queryKey: [ 'a4a-client-referral', agencyId, referralId, secret ],
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: `/agency-client/agency/${ agencyId }/referrals/${ referralId }`,
				},
				{
					secret,
				}
			),
		enabled: isClient && !! agencyId && !! referralId && !! secret,
		refetchOnWindowFocus: false,
	} );

	return data;
}
