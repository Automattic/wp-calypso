import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { requestDSP } from 'calypso/lib/promote-post';

export const useCancelCampaignMutation = ( onError: () => void ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async ( { siteId, campaignId }: { siteId: number; campaignId: number } ) =>
			await requestDSP< { results: Campaign[] } >( siteId, `/campaigns/${ campaignId }/stop` ),
		{
			onSuccess( data, { siteId } ) {
				queryClient.invalidateQueries( [ 'promote-post-campaigns', siteId ] );
			},
			onError,
		}
	);

	const { mutate } = mutation;
	const cancelCampaign = useCallback(
		( siteId, campaignId ) => mutate( { siteId, campaignId } ),
		[ mutate ]
	);

	return { cancelCampaign, ...mutation };
};

export default useCancelCampaignMutation;
