import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';

export function useSharingButtonsQuery( siteId ) {
	return useQuery(
		[ 'sharing-buttons', siteId ],
		() => wpcom.req.get( `/sites/${ siteId }/sharing-buttons` ),

		{
			enabled: !! siteId,
			select( data ) {
				return data.sharing_buttons;
			},
		}
	);
}

export function useSaveSharingButtonsMutation( siteId ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { buttons } ) =>
			wpcom.req.post( `/sites/${ siteId }/sharing-buttons`, { sharing_buttons: buttons } ),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'sharing-buttons', siteId ] );
			},
		}
	);

	const { mutate } = mutation;

	const saveSharingButtons = useCallback( ( buttons ) => mutate( { buttons } ), [ mutate ] );

	return { ...mutation, saveSharingButtons };
}
