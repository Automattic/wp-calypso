import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { requestDSP } from 'calypso/lib/promote-post';
import { errorNotice } from 'calypso/state/notices/actions';

export const useCancelCampaignMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const mutation = useMutation(
		async ( { siteId, campaignId }: { siteId: number; campaignId: number } ) =>
			await requestDSP< { results: Campaign[] } >( siteId, `/campaigns/${ campaignId }/stop` ),
		{
			onSuccess( data, { siteId } ) {
				queryClient.invalidateQueries( [ 'promote-post-campaigns', siteId ] );
			},
			onError() {
				dispatch( errorNotice( 'Something wrong happened, please try again later.' ) );
			},
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
